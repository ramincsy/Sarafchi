from flask import Blueprint, request, jsonify  # type: ignore
from flask_jwt_extended import (  # type: ignore
    create_access_token, create_refresh_token, jwt_required,
    get_jwt_identity, set_access_cookies, set_refresh_cookies
)
from datetime import  timezone
from user_models import Users, JwtTokens, db, user_schema, users_schema
from sqlalchemy import text  # type: ignore
from sqlalchemy.sql import text  # type: ignore
from token_utils import TokenManager
from Iran_DateTime import get_iran_time
user_bp = Blueprint('user_bp', __name__)


def get_user_info_by_id(user_id):
    """
    دریافت اطلاعات کاربر بر اساس UserID از استور پروسیجر spGetUserDetails5.
    """
    try:
        # فراخوانی spGetUserDetails5 برای دریافت جزئیات کاربر
        user_details_result = db.session.execute(
            text("EXEC spGetUserDetails5 :UserID"),
            {"UserID": user_id}
        ).fetchone()

        # چاپ پاسخ دیتابیس برای اشکال‌زدایی
        print("Database response:", user_details_result)

        if not user_details_result:
            raise ValueError("User details not found")

        # استخراج JSON از اولین عنصر تاپل
        user_details_json = user_details_result[0]

        if not user_details_json:
            raise ValueError("Failed to fetch user details JSON")

        # تبدیل JSON به دیکشنری
        import json
        user_info = json.loads(user_details_json)

        return user_info
    except Exception as e:
        print(f"Error fetching user details: {str(e)}")
        raise


@user_bp.route('/login', methods=['POST'])
def login():
    try:
        print("=== Incoming Request Details ===")
        print(f"Request Headers: {request.headers}")
        print(f"Request JSON Body: {request.get_json()}")
        print("================================")

        # دریافت اطلاعات ورود
        data = request.get_json()
        print(f"Parsed data: {data}")
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        device_id = data.get('device_id', 'Unknown Device')
        ip_address = request.headers.get(
            'X-Forwarded-For', request.remote_addr) or "127.0.0.1"

        if not email or not password:
            print("Missing email or password.")
            return jsonify({'error': 'Email and password are required'}), 400

        print(f"Login attempt with Email: {email}, Device ID: {
              device_id}, IP Address: {ip_address}")

        # اعتبارسنجی کاربر
        try:
            user_id_result = db.session.execute(
                text("""DECLARE @UserID INT; EXEC spLoginUser2 :Email, :Password, @UserID = @UserID OUTPUT; SELECT @UserID AS UserID;"""),
                {"Email": email, "Password": password}
            ).fetchone()
            print(f"Database response: {user_id_result}")
        except Exception as db_error:
            print(f"Database query failed: {str(db_error)}")
            return jsonify({'error': 'Database error occurred'}), 500

        if not user_id_result or user_id_result.UserID is None:
            print("User not found or invalid credentials.")
            return jsonify({'error': 'Invalid credentials'}), 401

        user_id = user_id_result.UserID
        print(f"Authenticated User ID: {user_id}")

        # دریافت اطلاعات کاربر
        try:
            user_info = get_user_info_by_id(user_id)
            print(f"User Info: {user_info}")
        except Exception as user_info_error:
            print(f"Error fetching user details: {str(user_info_error)}")
            return jsonify({'error': 'Failed to fetch user info'}), 500

        # ایجاد و مدیریت توکن‌ها
        try:
            access_token, refresh_token, refresh_token_expiry = TokenManager.create_tokens(
                user_id=user_id,
                user_info=user_info,
                device_id=device_id,
                purpose="Login",
                ip_address=ip_address
            )
            print(f"Generated tokens: Access Token: {
                  access_token}, Refresh Token: {refresh_token}")
        except Exception as token_error:
            print(f"Error generating tokens: {str(token_error)}")
            return jsonify({'error': 'Failed to generate tokens'}), 500
        current_time_utc = get_iran_time().astimezone(timezone.utc)
        access_token_expiry = current_time_utc + TokenManager.ACCESS_TOKEN_EXPIRATION
        refresh_token_expiry = current_time_utc + TokenManager.REFRESH_TOKEN_EXPIRATION

        response_data = {
            'message': 'Login successful',
            'access_token': access_token,
            "access_token_expiry": access_token_expiry.isoformat(),
            'refresh_token': refresh_token,
            'refresh_token_expiry': refresh_token_expiry.isoformat(),
            'user_info': user_info
        }
        print(f"response_data (response_data): {response_data}")

        print("Login process completed successfully.")
        return jsonify(response_data), 200

    except Exception as e:
        db.session.rollback()
        print(f"Unhandled error during login: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


def get_user_roles_permissions(user_id):
    roles_permissions = db.session.execute(
        text("EXEC spGetUsersWithRolesAndPermissions2 @UserID=:user_id"),
        {"user_id": user_id}
    ).fetchall()
    roles_permissions = [dict(row._mapping) for row in roles_permissions]

    roles = list(set(row['RoleName']
                 for row in roles_permissions if row['RoleName']))
    role_ids = list(set(row['RoleID']
                    for row in roles_permissions if row['RoleID']))
    permissions = list(set(row['PermissionName']
                       for row in roles_permissions if row['PermissionName']))
    permission_ids = list(set(row['PermissionID']
                          for row in roles_permissions if row['PermissionID']))
    return roles, role_ids, permissions, permission_ids


@user_bp.route('/listusers', methods=['GET'])
def listusers():
    try:
        all_users = Users.query.all()
        return jsonify(users_schema.dump(all_users)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_bp.route('/useradd', methods=['POST'])
def useradd():
    try:
        data = request.json

        print("Executing spAddUserWithWallet...")

        # ایجاد cursor
        connection = db.session.connection().connection
        cursor = connection.cursor()

        # اجرای استور پروسیجر
        cursor.execute("""
            DECLARE @UserID INT;
            DECLARE @WalletAddress NVARCHAR(255);

            EXEC spAddUserWithWallet
                @FirstName = ?,
                @LastName = ?,
                @NationalID = ?,
                @PhoneNumber = ?,
                @Email = ?,
                @Password = ?,
                @CreatedBy = ?,
                @UserID = @UserID OUTPUT,
                @WalletAddress = @WalletAddress OUTPUT;

            SELECT @UserID AS UserID, @WalletAddress AS WalletAddress;
        """, (
            data.get("FirstName"),
            data.get("LastName"),
            data.get("NationalID"),
            data.get("PhoneNumber"),
            data.get("Email"),
            data.get("Password"),
            data.get("CreatedBy", "System")
        ))

        # دریافت نتیجه
        result = cursor.fetchone()
        if not result:
            raise Exception("Failed to retrieve UserID or WalletAddress.")

        user_id, wallet_address = result
        print(f"User created with UserID: {
              user_id}, WalletAddress: {wallet_address}")

        # بررسی نتیجه
        if not user_id or not wallet_address:
            raise Exception("Failed to create user or assign wallet address.")

        # ثبت تغییرات
        db.session.commit()

        # پاسخ موفقیت‌آمیز
        return jsonify({
            "message": "User created and wallet assigned successfully",
            "userID": user_id,
            "walletAddress": wallet_address
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

    finally:
        # بستن cursor
        try:
            cursor.close()
        except:
            pass


@user_bp.route('/userupdate/<int:user_id>', methods=['PUT'])
def userupdate(user_id):
    data = request.json
    try:
        user = Users.query.get(user_id)
        if not user:
            return jsonify({"error": "کاربر یافت نشد"}), 404

        user.FirstName = data['FirstName']
        user.LastName = data['LastName']
        user.NationalID = data['NationalID']
        user.PhoneNumber = data['PhoneNumber']
        user.Email = data['Email']
        if data.get('Password'):
            # هش‌گذاری رمز عبور پیشنهاد می‌شود
            user.Password = data['Password']
        user.WalletAddress = data.get('WalletAddress', user.WalletAddress)
        db.session.commit()
        return jsonify({"message": "کاربر با موفقیت ویرایش شد", "user": user_schema.dump(user)}), 200
    except Exception as e:
        return jsonify({"error": f"خطا در ویرایش کاربر: {str(e)}"}), 400


@user_bp.route('/userdelete/<int:user_id>', methods=['DELETE'])
def userdelete(user_id):
    try:
        user = Users.query.get(user_id)
        if not user:
            return jsonify({"error": "کاربر یافت نشد"}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "کاربر با موفقیت حذف شد"}), 200
    except Exception as e:
        return jsonify({"error": f"خطا در حذف کاربر: {str(e)}"}), 400


@user_bp.route('/userdetails/<int:user_id>', methods=['GET'])
def get_user_details(user_id):
    """
    دریافت اطلاعات کامل کاربر با استفاده از استور پروسیجر spGetUserDetails
    """
    try:
        # اجرای استور پروسیجر برای دریافت اطلاعات کاربر
        result = db.session.execute(
            text("EXEC spGetUserDetails @UserID=:UserID"),
            {"UserID": user_id}
        ).fetchall()

        # تبدیل داده‌های بازگشتی به قالب مناسب
        user_details = [dict(row._mapping) for row in result]

        if not user_details:
            return jsonify({"message": "کاربر یافت نشد"}), 404

        # تفکیک اطلاعات
        user_info = {
            "UserID": user_details[0].get("UserID"),
            "FirstName": user_details[0].get("FirstName"),
            "LastName": user_details[0].get("LastName"),
            "Email": user_details[0].get("Email"),
            "PhoneNumber": user_details[0].get("PhoneNumber"),
            "NationalID": user_details[0].get("NationalID"),
            "WalletAddress": user_details[0].get("WalletAddress"),
            "DateCreated": user_details[0].get("DateCreated"),
            "Roles": [],
            "Permissions": [],
            "Pages": []
        }

        # جمع‌آوری داده‌ها
        roles_set = set()
        permissions_set = set()
        pages_set = set()

        for row in user_details:
            if row.get("RoleName"):
                roles_set.add(row["RoleName"])
            if row.get("PermissionName"):
                permissions_set.add(row["PermissionName"])
            if row.get("PageName"):
                pages_set.add(row["PageName"])

        user_info["Roles"] = list(roles_set)
        user_info["Permissions"] = list(permissions_set)
        user_info["Pages"] = list(pages_set)

        return jsonify(user_info), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_bp.route('/logout', methods=['POST'])
def logout():
    try:
        # دریافت اطلاعات کاربر از بدنه درخواست
        data = request.json
        user_id = data.get('user_id')
        device_id = data.get('device_id', 'Unknown Device')
        ip_address = request.headers.get(
            'X-Forwarded-For', request.remote_addr) or "127.0.0.1"

        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        print(f"Logout request from User ID: {
              user_id}, Device ID: {device_id}, IP Address: {ip_address}")

        # باطل کردن توکن‌ها
        try:
            # باطل کردن توکن‌ها در دیتابیس یا سیستم مدیریت توکن‌ها
            TokenManager.revoke_tokens(user_id=user_id, device_id=device_id)
            print(f"Tokens revoked for User ID: {user_id}")
        except Exception as token_error:
            print(f"Error revoking tokens: {str(token_error)}")
            return jsonify({'error': 'Failed to revoke tokens'}), 500

        # پاسخ موفقیت‌آمیز
        response_data = {
            'message': 'Logout successful',
            'user_id': user_id,
            'device_id': device_id,
            'ip_address': ip_address
        }
        return jsonify(response_data), 200

    except Exception as e:
        print(f"Unhandled error during logout: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
