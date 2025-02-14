from firebase_admin import messaging
from firebase_admin import credentials, initialize_app
from flask import jsonify
from user_models import db  # فرض می‌کنیم مدل‌های کاربر در این فایل قرار دارند
import logging

# تنظیمات لاگ‌گیری
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# مقداردهی اولیه Firebase
cred = credentials.Certificate("sarafchi-33502-firebase-adminsdk-i91s3-2f97b29b75.json")
initialize_app(cred)

def send_push_notification(token, title, body):
    """
    ارسال Push Notification به دستگاه کاربر
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
        response = messaging.send(message)
        print(firebase_admin.__version__)
        logger.info(f"Notification sent successfully: {response}")
        return True, response
    except messaging.FirebaseError as e:  # مدیریت خطاهای Firebase
        logger.error(f"Firebase error: {e}", exc_info=True)
        return False, str(e)
    except Exception as e:  # سایر خطاها
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return False, str(e)

def save_user_token(user_id, token):
    """
    ذخیره توکن دستگاه کاربر در دیتابیس
    :param user_id: شناسه کاربر
    :param token: توکن دستگاه کاربر
    """
    logger.info(f"Attempting to save token for user {user_id}")
    try:
        query = """
        INSERT INTO UserTokens_firebase (UserID, Token)
        VALUES (:user_id, :token)
        """
        db.session.execute(query, {"user_id": user_id, "token": token})
        db.session.commit()
        logger.info(f"Token saved successfully for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Error saving user token: {e}", exc_info=True)
        db.session.rollback()
        return False

def get_user_tokens(user_id):
    """
    دریافت توکن‌های دستگاه‌های کاربر از دیتابیس
    :param user_id: شناسه کاربر
    :return: لیست توکن‌ها
    """
    logger.info(f"Attempting to retrieve tokens for user {user_id}")
    try:
        query = """
        SELECT Token FROM UserTokens_firebase WHERE UserID = :user_id
        """
        result = db.session.execute(query, {"user_id": user_id}).fetchall()
        tokens = [row[0] for row in result]  # تبدیل نتیجه به لیست توکن‌ها
        logger.info(f"Retrieved {len(tokens)} tokens for user {user_id}")
        return tokens
    except Exception as e:
        logger.error(f"Error fetching user tokens: {e}", exc_info=True)
        return []

def send_notification_to_user(user_id, title, body):
    """
    ارسال نوتیفیکیشن به تمام دستگاه‌های یک کاربر
    :param user_id: شناسه کاربر
    :param title: عنوان نوتیفیکیشن
    :param body: متن نوتیفیکیشن
    :return: نتیجه ارسال
    """
    logger.info(f"Attempting to send notification to user {user_id}")
    tokens = get_user_tokens(user_id)
    if not tokens:
        logger.warning(f"No tokens found for user {user_id}")
        return False, "No tokens found for the user."

    results = []
    for token in tokens:
        success, response = send_push_notification(token, title, body)
        results.append({"token": token, "success": success, "response": response})

    logger.info(f"Notification results for user {user_id}: {results}")
    return True, results

def update_user_token(user_id, old_token, new_token):
    """
    به‌روزرسانی توکن دستگاه کاربر
    :param user_id: شناسه کاربر
    :param old_token: توکن قدیمی
    :param new_token: توکن جدید
    """
    logger.info(f"Attempting to update token for user {user_id}")
    try:
        # حذف توکن قدیمی
        delete_query = """
        DELETE FROM UserTokens_firebase WHERE UserID = :user_id AND Token = :old_token
        """
        db.session.execute(delete_query, {"user_id": user_id, "old_token": old_token})

        # ذخیره توکن جدید
        insert_query = """
        INSERT INTO UserTokens_firebase (UserID, Token)
        VALUES (:user_id, :new_token)
        """
        db.session.execute(insert_query, {"user_id": user_id, "new_token": new_token})
        db.session.commit()
        logger.info(f"Token updated successfully for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Error updating user token: {e}", exc_info=True)
        db.session.rollback()
        return False