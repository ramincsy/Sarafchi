import logging
import asyncio
from functools import wraps
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from Iran_DateTime import get_iran_time
import firebase_admin
from firebase_admin import credentials, messaging, exceptions
from firebase_admin.exceptions import FirebaseError
from flask import Blueprint, request, jsonify
from pydantic import BaseModel, ValidationError
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from user_models import db, UserTokens, PushNotifications  # فرض می‌کنیم مدل‌ها در این فایل قرار دارند

# تنظیمات لاگ‌گیری
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# مقداردهی اولیه Firebase
cred = credentials.Certificate("sarafchi-33502-firebase-adminsdk-i91s3-2f97b29b75.json")
firebase_admin.initialize_app(cred)

# ایجاد Blueprint برای Push Notifications
push_notification_bp = Blueprint('push_notification', __name__)


# مدل‌های Pydantic برای اعتبارسنجی داده‌ها
class NotificationRequest(BaseModel):
    user_id: int
    title: str  # عنوان نوتیفیکیشن
    message: str  # متن نوتیفیکیشن


class TokenUpdateRequest(BaseModel):
    user_id: int
    old_token: str
    new_token: str


class TokenSaveRequest(BaseModel):
    user_id: int
    token: str
    title: Optional[str] = None
    message: Optional[str] = None


# دکوراتور برای مدیریت خطاها
def handle_errors(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {e}", exc_info=True)
            return False, f"Unexpected error: {e}"
    return wrapper


# تابع برای حذف توکن‌های نامعتبر
@handle_errors
def remove_invalid_token(user_id: int, token: str) -> bool:
    """
    حذف توکن نامعتبر از دیتابیس
    """
    query = text("""
    DECLARE @ErrorCode INT, @ErrorMessage NVARCHAR(255);
    EXEC Firebase_ManageTokens 
        @Action = 'DELETE', 
        @UserID = :user_id,
        @Token = :token, 
        @ErrorMessage = @ErrorMessage OUTPUT, 
        @ErrorCode = @ErrorCode OUTPUT;
    SELECT @ErrorCode AS ErrorCode, @ErrorMessage AS ErrorMessage;
    """)
    result = db.session.execute(query, {"user_id": user_id, "token": token}).fetchone()
    db.session.commit()

    if result and result.ErrorCode == 0:
        logger.info(f"Token {token} removed successfully from database.")
        return True
    else:
        logger.error(f"Failed to remove token {token} from database. Error: {result.ErrorMessage if result else 'Unknown error'}")
        return False


# تابع برای ارسال Push Notification
@handle_errors
async def send_push_notification_async(token: str, title: str, body: str, sender_id: int, receiver_id: int) -> Tuple[bool, str]:
    """
    ارسال Push Notification به دستگاه کاربر به صورت ناهمزمان و ذخیره اطلاعات در دیتابیس (فقط در صورت موفقیت)
    """
    logger.info(f"Attempting to send notification to token: {token}")
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=token,
    )

    try:
        # ارسال نوتیفیکیشن به Firebase
        response = await asyncio.to_thread(messaging.send, message)
        logger.info(f"Notification sent successfully: {response}")

        # ذخیره اطلاعات نوتیفیکیشن در دیتابیس (فقط در صورت موفقیت)
        save_notification(
            sender_id=sender_id,
            receiver_id=receiver_id,
            title=title,
            message=body,
            sent_at=get_iran_time(),
            is_delivered=True,  # ارسال موفقیت‌آمیز
            delivery_details=response
        )

        return True, response

    except firebase_admin._messaging_utils.UnregisteredError:
        logger.warning(f"Token {token} is unregistered. Removing from database...")
        remove_invalid_token(receiver_id, token)  # حذف توکن نامعتبر از دیتابیس
        return False, "Token is unregistered and has been removed."

    except FirebaseError as e:
        logger.error(f"Firebase error: {e}", exc_info=True)
        return False, f"Firebase error: {e}"

    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return False, f"Unexpected error: {e}"
# تابع برای ذخیره توکن کاربر
@handle_errors
def save_user_token(user_id: int, token: str, title: Optional[str] = None, message: Optional[str] = None) -> Tuple[bool, str]:
    """
    ذخیره توکن دستگاه کاربر در دیتابیس با استفاده از Stored Procedure
    """
    logger.info(f"Attempting to save token for user {user_id}")
    query = text("""
    DECLARE @ErrorCode INT, @ErrorMessage NVARCHAR(255);
    EXEC Firebase_ManageTokens 
        @Action = 'SAVE', 
        @UserID = :user_id, 
        @Token = :token, 
        @Title = :title, 
        @Message = :message, 
        @ErrorMessage = @ErrorMessage OUTPUT, 
        @ErrorCode = @ErrorCode OUTPUT;
    SELECT @ErrorCode AS ErrorCode, @ErrorMessage AS ErrorMessage;
    """)
    
    try:
        result = db.session.execute(query, {
            "user_id": user_id,
            "token": token,
            "title": title,
            "message": message
        }).fetchone()
        db.session.commit()

        error_code = result.ErrorCode
        error_message = result.ErrorMessage

        if error_code == 0:
            logger.info(f"Token saved successfully for user {user_id}")
            return True, error_message
        else:
            logger.warning(f"Error saving token: {error_message}")
            return False, error_message
    except FirebaseError as e:
        logger.error(f"Firebase error: {e}", exc_info=True)
        return False, f"Firebase error: {e}"
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return False, f"Unexpected error: {e}"

# تابع برای دریافت توکن‌های کاربر
@handle_errors
def get_user_tokens(user_id: int) -> List[str]:
    """
    دریافت توکن‌های دستگاه‌های کاربر از دیتابیس
    """
    logger.info(f"Attempting to retrieve tokens for user {user_id}")
    stmt = select(UserTokens.Token).where(UserTokens.UserID == user_id)
    result = db.session.execute(stmt).fetchall()
    tokens = [row.Token for row in result]
    logger.info(f"Retrieved {len(tokens)} tokens for user {user_id}")
    return tokens


# تابع برای ارسال نوتیفیکیشن به کاربر
@handle_errors
async def send_notification_to_user_async(sender_id: int, receiver_id: int, title: str, body: str) -> Tuple[bool, List[Dict]]:
    """
    ارسال نوتیفیکیشن به تمام دستگاه‌های یک کاربر به صورت ناهمزمان
    """
    logger.info(f"Attempting to send notification to user {receiver_id}")
    
    # دریافت توکن‌های گیرنده
    tokens = get_user_tokens(receiver_id)
    if not tokens:
        logger.warning(f"No tokens found for user {receiver_id}")
        return False, "No tokens found for the user."

    # ارسال نوتیفیکیشن به تمام توکن‌های گیرنده
    tasks = [send_push_notification_async(token, title, body, sender_id, receiver_id) for token in tokens]
    results = await asyncio.gather(*tasks)

    # جمع‌آوری نتایج موفقیت‌آمیز
    valid_results = [
        {"token": token, "success": success, "response": response}
        for token, (success, response) in zip(tokens, results) if success
    ]

    logger.info(f"Notification results for user {receiver_id}: {valid_results}")
    return True, valid_results

@handle_errors
def update_user_token(user_id: int, old_token: str, new_token: str) -> Tuple[bool, str]:
    """
    به‌روزرسانی توکن دستگاه کاربر با استفاده از Stored Procedure
    """
    logger.info(f"Attempting to update token for user {user_id}")
    query = text("""
    DECLARE @ErrorCode INT, @ErrorMessage NVARCHAR(255);
    EXEC Firebase_ManageTokens 
        @Action = 'UPDATE', 
        @UserID = :user_id, 
        @OldToken = :old_token, 
        @NewToken = :new_token, 
        @ErrorMessage = @ErrorMessage OUTPUT, 
        @ErrorCode = @ErrorCode OUTPUT;
    SELECT @ErrorCode AS ErrorCode, @ErrorMessage AS ErrorMessage;
    """)
    result = db.session.execute(query, {
        "user_id": user_id,
        "old_token": old_token,
        "new_token": new_token
    }).fetchone()
    db.session.commit()

    error_code = result.ErrorCode
    error_message = result.ErrorMessage

    if error_code == 0:
        logger.info(f"Token updated successfully for user {user_id}")
        return True, error_message
    else:
        logger.warning(f"Error updating token: {error_message}")
        return False, error_message


# تابع برای دریافت نوتیفیکیشن‌های کاربر
@handle_errors
def get_notifications(user_id: int) -> List[Dict]:
    """
    دریافت نوتیفیکیشن‌های کاربر از دیتابیس
    """
    logger.info(f"Attempting to retrieve notifications for user {user_id}")
    stmt = select(PushNotifications).where(PushNotifications.ReceiverID == user_id)
    result = db.session.execute(stmt).fetchall()
    
    notifications = [{
        "id": row.NotificationID,
        "sender_id": row.SenderID,
        "receiver_id": row.ReceiverID,
        "title": row.Title,
        "message": row.Message,
        "sent_at": row.SentAt.isoformat() if row.SentAt else None,
        "is_delivered": row.IsDelivered,
        "delivery_details": row.DeliveryDetails,
        "created_at": row.CreatedAt.isoformat() if row.CreatedAt else None,
    } for row in result]
    
    logger.info(f"Retrieved {len(notifications)} notifications for user {user_id}")
    return notifications


# Route برای ذخیره توکن
@push_notification_bp.route('/save-token', methods=['POST'])
def save_token():
    try:
        data = request.json
        request_data = TokenSaveRequest(**data)
        
        success, message = save_user_token(request_data.user_id, request_data.token, request_data.title, request_data.message)
        if success:
            return jsonify({"message": message}), 200
        else:
            return jsonify({"error": message}), 409  # Conflict
    except ValidationError as e:
        logger.warning(f"Invalid request data: {e}")
        return jsonify({"error": "Invalid request data"}), 400
    except Exception as e:
        logger.exception(f"Error in save_token: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Route برای ارسال نوتیفیکیشن
@push_notification_bp.route('/send', methods=['POST'])
async def send_notification():
    try:
        data = request.json
        request_data = NotificationRequest(**data)
        sender_id = 1  # تعیین sender_id (به‌طور پیش‌فرض 1 در نظر گرفته شده است)

        success, response = await send_notification_to_user_async(
            sender_id=sender_id,
            receiver_id=request_data.user_id,
            title=request_data.title,
            body=request_data.message  # استفاده از body به جای message
        )
        if success:
            return jsonify({"message": "Notification sent successfully", "details": response}), 200
        else:
            return jsonify({"error": "Failed to send notification", "details": response}), 500
    except ValidationError as e:
        logger.warning(f"Invalid request data: {e}")
        return jsonify({"error": "Invalid request data"}), 400
    except FirebaseError as e:
        logger.error(f"Firebase error: {e}", exc_info=True)
        return jsonify({"error": f"Firebase error: {e}"}), 500
    except Exception as e:
        logger.exception(f"Error in send_notification: {e}")
        return jsonify({"error": "Internal server error"}), 500
# Route برای به‌روزرسانی توکن
@push_notification_bp.route('/update-token', methods=['POST'])
def update_token():
    try:
        data = request.json
        request_data = TokenUpdateRequest(**data)
        
        success, message = update_user_token(request_data.user_id, request_data.old_token, request_data.new_token)
        if success:
            return jsonify({"message": message}), 200
        else:
            return jsonify({"error": message}), 500
    except ValidationError as e:
        logger.warning(f"Invalid request data: {e}")
        return jsonify({"error": "Invalid request data"}), 400
    except Exception as e:
        logger.exception(f"Error in update_token: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Route برای دریافت نوتیفیکیشن‌ها
@push_notification_bp.route('/notifications', methods=['GET'])
def handle_notifications():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            logger.warning("User ID is missing.")
            return jsonify({"error": "User ID is required"}), 400

        notifications = get_notifications(int(user_id))
        return jsonify({"notifications": notifications}), 200
    except Exception as e:
        logger.exception(f"Error fetching notifications: {e}")
        return jsonify({"error": "Internal server error"}), 500


@handle_errors
def save_notification(
    sender_id: int,
    receiver_id: int,
    title: str,
    message: str,
    sent_at: Optional[datetime] = None,
    is_delivered: bool = False,
    delivery_details: str = ""
) -> Tuple[bool, str]:
    """
    ذخیره نوتیفیکیشن ارسال‌شده در دیتابیس با استفاده از Stored Procedure
    """
    if sent_at is None:
        sent_at = get_iran_time()
    logger.info(f"Attempting to save notification for receiver {receiver_id}")
    query = text("""
    DECLARE @ErrorCode INT, @ErrorMessage NVARCHAR(255);
    EXEC SaveNotification
        @SenderID = :sender_id,
        @ReceiverID = :receiver_id,
        @Title = :title,
        @Message = :message,
        @SentAt = :sent_at,
        @IsDelivered = :is_delivered,
        @DeliveryDetails = :delivery_details,
        @ErrorMessage = @ErrorMessage OUTPUT,
        @ErrorCode = @ErrorCode OUTPUT;
    SELECT @ErrorCode AS ErrorCode, @ErrorMessage AS ErrorMessage;
    """)
    
    try:
        result = db.session.execute(query, {
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "title": title,
            "message": message,
            "sent_at": sent_at,
            "is_delivered": is_delivered,
            "delivery_details": delivery_details
        }).fetchone()
        db.session.commit()

        error_code = result.ErrorCode
        error_message = result.ErrorMessage

        if error_code == 0:
            logger.info(f"Notification saved successfully for receiver {receiver_id}")
            return True, error_message
        else:
            logger.warning(f"Error saving notification: {error_message}")
            return False, error_message
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return False, f"Unexpected error: {e}"