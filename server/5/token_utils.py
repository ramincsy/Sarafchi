from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import datetime, timezone, timedelta
from user_models import db
from sqlalchemy import text

token_bp = Blueprint("token_bp", __name__)


class TokenManager:
    ACCESS_TOKEN_EXPIRATION = timedelta(minutes=20)
    REFRESH_TOKEN_EXPIRATION = timedelta(days=7)

    @staticmethod
    def create_tokens(user_id, user_info, device_id, ip_address, purpose="Default"):
        access_token = create_access_token(
            identity=user_info,
            expires_delta=TokenManager.ACCESS_TOKEN_EXPIRATION
        )
        refresh_token = create_refresh_token(
            identity={"id": user_id},
            expires_delta=TokenManager.REFRESH_TOKEN_EXPIRATION
        )

        expire_date = datetime.now(timezone.utc) + \
            TokenManager.REFRESH_TOKEN_EXPIRATION
        print(f"Calculated Refresh Token Expiry: {expire_date}")
        expire_date_str = expire_date.isoformat()

        print(f"Expire Date (ISO Format): {expire_date_str}")

        # ذخیره توکن در پایگاه داده
        db.session.execute(
            text("""
                EXEC spManageTokens :UserId, :RefreshToken, :ExpireDate, 'CREATE', :DeviceId, :IPAddress, :Purpose
            """),
            {
                "UserId": user_id,
                "RefreshToken": refresh_token,
                "ExpireDate": expire_date,
                "DeviceId": device_id,
                "IPAddress": ip_address,
                "Purpose": purpose
            }
        )
        db.session.commit()

        # بررسی و لاگ توکن ذخیره‌شده
        stored_token = db.session.execute(
            text("""
                EXEC spManageTokens NULL, :RefreshToken, NULL, 'VALIDATE', :DeviceId, NULL, NULL
            """),
            {"RefreshToken": refresh_token, "DeviceId": device_id}
        ).fetchone()

        if stored_token:
            print(f"Token stored successfully: {stored_token}")
        else:
            print("Token not found after creation!")

        return access_token, refresh_token, expire_date

    @staticmethod
    def validate_refresh_token(refresh_token, device_id):
        try:
            print(f"Validating refresh token: refresh_token={
                refresh_token}, device_id={device_id}")
            token_in_db = db.session.execute(
                text("""
                    EXEC spManageTokens NULL, :RefreshToken, NULL, 'VALIDATE', :DeviceId, NULL, NULL
                """),
                {"RefreshToken": refresh_token, "DeviceId": device_id}
            ).fetchone()

            if not token_in_db:
                print(f"Token not found for device_id={
                    device_id} and refresh_token={refresh_token}")
                raise ValueError("Invalid or expired refresh token.")

            expire_date = token_in_db.ExpireDate.replace(
                tzinfo=timezone.utc) if token_in_db.ExpireDate else None
            if not expire_date or expire_date < datetime.now(timezone.utc):
                print(f"Token expired at {expire_date}")
                raise ValueError("Refresh token has expired.")

            print(f"Token validated successfully: {token_in_db}")
            return token_in_db
        except Exception as e:
            print(f"Error in validate_refresh_token: {e}")
            raise


@token_bp.route('/refresh', methods=['POST'])
def refresh():
    try:
        data = request.get_json()
        refresh_token = data.get("refresh_token")
        device_id = data.get("device_id", "Unknown Device")
        ip_address = request.headers.get(
            'X-Forwarded-For', request.remote_addr) or "127.0.0.1"

        print(f"Received refresh request: refresh_token={
              refresh_token}, device_id={device_id}, ip_address={ip_address}")

        if not refresh_token:
            return jsonify({'message': 'No refresh token provided'}), 400

        # اعتبارسنجی توکن
        token_in_db = TokenManager.validate_refresh_token(
            refresh_token, device_id)

        # دریافت اطلاعات کاربر
        user_info = get_user_info_by_id(token_in_db.UserId)

        # ایجاد توکن‌های جدید
        access_token, new_refresh_token, refresh_token_expiry = TokenManager.create_tokens(
            user_id=token_in_db.UserId,
            user_info=user_info,
            device_id=device_id,
            purpose="Refresh",
            ip_address=ip_address
        )

        return jsonify({
            'message': 'Token refreshed successfully',
            'access_token': access_token,
            'access_token_expiry': (datetime.now(timezone.utc) + TokenManager.ACCESS_TOKEN_EXPIRATION).isoformat(),
            'refresh_token': new_refresh_token,
            'refresh_token_expiry': refresh_token_expiry.isoformat(),
            'user_info': user_info,
        }), 200

    except ValueError as e:
        print(f"Token validation error: {e}")
        return jsonify({'message': str(e), 'type': 'validation_error'}), 401
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({'message': 'Unexpected error occurred.', 'details': str(e)}), 500


@token_bp.route('/logout', methods=['POST'])
def logout():
    try:
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        device_id = data.get('device_id', 'Unknown Device')

        if not refresh_token:
            return jsonify({'message': 'Refresh token is required'}), 400

        TokenManager.revoke_token(refresh_token, device_id)
        return jsonify({'message': 'Logged out successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error during logout: {str(e)}")
        return jsonify({'message': 'Error during logout', 'details': str(e)}), 500


def get_user_info_by_id(user_id):
    try:
        user_details_result = db.session.execute(
            text("EXEC spGetUserDetails5 :UserID"),
            {"UserID": user_id}
        ).fetchone()

        if not user_details_result:
            raise ValueError("User details not found")

        user_details_json = dict(user_details_result._mapping)
        import json
        user_info = json.loads(user_details_json.get(
            "JSON_F52E2B61-18A1-11d1-B105-00805F49916B", "{}"))

        if not user_info:
            raise ValueError("Failed to parse user details JSON")

        return user_info
    except Exception as e:
        print(f"Error fetching user details: {str(e)}")
        raise
