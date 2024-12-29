from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required,
    get_jwt_identity
)
from datetime import datetime, timedelta
from user_models import Users, JwtTokens, db, user_schema, users_schema
from sqlalchemy import text
from sqlalchemy.sql import text
user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = Users.query.filter_by(Email=email).first()

    if user and user.Password == password:
        try:
            # دریافت نقش‌ها و مجوزهای کاربر
            user_roles_permissions = db.session.execute(
                text("EXEC spGetUsersWithRolesAndPermissions")
            ).fetchall()
            user_roles_permissions = [
                dict(row._mapping) for row in user_roles_permissions if row._mapping["UserID"] == user.ID
            ]
            roles = list(set(row['RoleName'] for row in user_roles_permissions if row['RoleName']))
            role_ids = list(set(row['RoleID'] for row in user_roles_permissions if row['RoleID']))
            permissions = list(set(row['PermissionName'] for row in user_roles_permissions if row['PermissionName']))
            permission_ids = list(set(row['PermissionID'] for row in user_roles_permissions if row['PermissionID']))

            # دریافت اطلاعات صفحات
            pages_with_roles_permissions = db.session.execute(
                text("EXEC spGetPagesWithRolesAndPermissions")
            ).fetchall()
            pages = [dict(row._mapping) for row in pages_with_roles_permissions]

            # اطلاعات کامل کاربر
            existing_user_info = {
                "id": user.ID,
                "firstName": user.FirstName,
                "lastName": user.LastName,
                "email": user.Email,
                "roles": roles,
                "role_ids": role_ids,
                "permissions": permissions,
                "permission_ids": permission_ids,
                "pages": pages,
            }

            # ایجاد توکن JWT
            access_token_expires = timedelta(minutes=15)
            refresh_token_expires = timedelta(days=7)
            access_token = create_access_token(
                identity=existing_user_info,
                expires_delta=access_token_expires
            )
            refresh_token = create_refresh_token(
                identity={"id": user.ID}, expires_delta=refresh_token_expires
            )

            # ذخیره توکن رفرش
            expire_date = datetime.now() + refresh_token_expires
            new_token = JwtTokens(user_id=user.ID, refresh_token=refresh_token, expire_date=expire_date)
            db.session.add(new_token)
            db.session.commit()

            # ارسال پاسخ
            response_data = {
                'message': 'Login successful',
                'user_id': user.ID,
                'first_name': user.FirstName,
                'last_name': user.LastName,
                'email': user.Email,
                'roles': roles,
                'permissions': permissions,
                'pages': pages,
                'access_token': access_token,
                'refresh_token': refresh_token,
                'access_token_expiry': (datetime.now() + access_token_expires).isoformat(),
                'refresh_token_expiry': expire_date.isoformat()
            }
            response = jsonify(response_data)
            response.set_cookie(
                'refresh_token', refresh_token, httponly=True, secure=True,
                samesite='Strict', max_age=7 * 24 * 60 * 60
            )
            return response, 200

        except Exception as e:
            print(f"Error during login: {e}")
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Invalid credentials'}), 401

@user_bp.route('/refresh', methods=['POST'])
def refresh():
    refresh_token = request.cookies.get('refresh_token')
    if not refresh_token:
        return jsonify({'message': 'No refresh token provided'}), 401

    token_in_db = JwtTokens.query.filter_by(RefreshToken=refresh_token, Revoked=False).first()
    if not token_in_db or token_in_db.ExpireDate < datetime.now():
        return jsonify({'message': 'Refresh token is invalid or expired'}), 401

    user = Users.query.get(token_in_db.UserId)
    new_access_token = create_access_token(
        identity={"id": user.ID, "name": user.FirstName, "email": user.Email},
        expires_delta=timedelta(minutes=15)
    )
    return jsonify({
        'access_token': new_access_token,
        'user_id': user.ID,
        'name': user.FirstName,
        'email': user.Email,
        'access_token_expiry': (datetime.now() + timedelta(minutes=15)).isoformat()
    }), 200


@user_bp.route('/logout', methods=['POST'])
def logout():
    try:
        # دریافت توکن از body
        data = request.get_json()
        refresh_token = data.get('refresh_token')

        if not refresh_token:
            return jsonify({'message': 'Refresh token is required'}), 400

        # به‌روزرسانی وضعیت توکن در پایگاه داده
        token_in_db = JwtTokens.query.filter_by(RefreshToken=refresh_token, Revoked=False).first()
        if not token_in_db:
            return jsonify({'message': 'Invalid refresh token'}), 401

        token_in_db.Revoked = True
        db.session.commit()

       
        # حذف کوکی `refresh_token`
        response = jsonify({'message': 'Logged out successfully', 'clear_local_storage': True})
        response.set_cookie('refresh_token', '', expires=0, httponly=True, samesite='Strict', secure=True)

        return response, 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error during logout', 'error': str(e)}), 500


@user_bp.route('/listusers', methods=['GET'])
def listusers():
    try:
        all_users = Users.query.all()
        return jsonify(users_schema.dump(all_users)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_bp.route('/useradd', methods=['POST'])
def useradd():
    data = request.json
    try:
        db.session.execute(
            text("""
                EXEC spAddUser
                    @FirstName=:FirstName,
                    @LastName=:LastName,
                    @NationalID=:NationalID,
                    @PhoneNumber=:PhoneNumber,
                    @Email=:Email,
                    @Password=:Password,
                    @CreatedBy=:CreatedBy,
                    @WalletAddress=:WalletAddress
            """),
            {
                "FirstName": data["FirstName"],
                "LastName": data["LastName"],
                "NationalID": data["NationalID"],
                "PhoneNumber": data["PhoneNumber"],
                "Email": data["Email"],
                "Password": data["Password"],
                "CreatedBy": data.get("CreatedBy", "System"),
                "WalletAddress": data.get("WalletAddress")
            }
        )
        db.session.commit()
        return jsonify({"message": "کاربر با موفقیت اضافه شد"}), 201
    except Exception as e:
        return jsonify({"error": f"خطا در افزودن کاربر: {str(e)}"}), 400


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
            user.Password = data['Password']  # هش‌گذاری رمز عبور پیشنهاد می‌شود
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
