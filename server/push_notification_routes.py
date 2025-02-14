# import logging
# import firebase_admin
# from firebase_admin import credentials, initialize_app ,messaging
# from flask import Blueprint, request, jsonify
# from push_notification_manager import save_user_token, send_notification_to_user, update_user_token
# from sqlalchemy.sql import text
# from firebase_admin import exceptions
# # ایجاد Blueprint برای Push Notifications
# push_notification_bp = Blueprint('push_notification', __name__, url_prefix='/api/push')

# # تنظیمات لاگ‌گیری
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# @push_notification_bp.route('/save-token', methods=['POST'])
# def save_token():
#     try:
#         data = request.json
#         user_id = data.get('user_id')
#         token = data.get('token')

#         if not (user_id and token):
#             logger.warning("Missing required fields: user_id or token.")
#             return jsonify({"error": "Missing required fields"}), 400

#         # ذخیره توکن در دیتابیس
#         success, message = save_user_token(user_id, token)
#         if success:
#             logger.info(f"Token saved successfully for user_id: {user_id}")
#             return jsonify({"message": message}), 200
#         else:
#             logger.warning(f"Failed to save token for user_id: {user_id}. Message: {message}")
#             return jsonify({"error": message}), 409  # Conflict
#     except Exception as e:
#         logger.exception(f"Error in save_token: {e}")
#         return jsonify({"error": "Internal server error"}), 500

# @push_notification_bp.route('/send', methods=['POST'])
# def send_notification():
#     """
#     API برای ارسال نوتیفیکیشن به کاربر
#     """
#     try:
#         data = request.json
#         user_id = data.get('user_id')
#         title = data.get('title')
#         message = data.get('message')

#         if not user_id:
#             logger.warning("User ID is missing.")
#             return jsonify({"error": "User ID is required"}), 400
#         if not title:
#             logger.warning("Title is missing.")
#             return jsonify({"error": "Title is required"}), 400
#         if not message:
#             logger.warning("Message is missing.")
#             return jsonify({"error": "Message is required"}), 400

#         # ارسال نوتیفیکیشن به کاربر
#         success, response = send_notification_to_user(user_id, title, message)

#         if success:
#             logger.info(f"Notification sent successfully to user_id: {user_id}")
#             return jsonify({"message": "Notification sent successfully", "details": response}), 200
#         else:
#             logger.error(f"Failed to send notification to user_id: {user_id}. Response: {response}")
#             return jsonify({"error": "Failed to send notification", "details": response}), 500
#     except Exception as e:
#         logger.exception(f"Error in send_notification: {e}")
#         return jsonify({"error": "Internal server error"}), 500

# @push_notification_bp.route('/update-token', methods=['POST'])
# def update_token():
#     """
#     API برای به‌روزرسانی توکن دستگاه کاربر
#     """
#     try:
#         data = request.json
#         user_id = data.get('user_id')
#         old_token = data.get('old_token')
#         new_token = data.get('new_token')

#         if not (user_id and old_token and new_token):
#             logger.warning("Missing required fields: user_id, old_token, or new_token.")
#             return jsonify({"error": "Missing required fields"}), 400

#         # به‌روزرسانی توکن کاربر
#         success, message = update_user_token(user_id, old_token, new_token)
#         if success:
#             logger.info(f"Token updated successfully for user_id: {user_id}")
#             return jsonify({"message": message}), 200
#         else:
#             logger.error(f"Failed to update token for user_id: {user_id}. Message: {message}")
#             return jsonify({"error": message}), 500
#     except Exception as e:
#         logger.exception(f"Error in update_token: {e}")
#         return jsonify({"error": "Internal server error"}), 500

# @push_notification_bp.route('/notifications', methods=['OPTIONS', 'GET'])
# def handle_notifications():
#     if request.method == 'OPTIONS':
#         return '', 200
#     try:
#         user_id = request.args.get('user_id')
#         if not user_id:
#             logger.warning("User ID is missing.")
#             return jsonify({"error": "User ID is required"}), 400

#         # فرض کنید get_notifications یک تابع برای دریافت نوتیفیکیشن‌ها از دیتابیس است
#         notifications = get_notifications(user_id)
#         logger.info(f"Retrieved {len(notifications)} notifications for user_id: {user_id}")
#         return jsonify({"notifications": notifications}), 200
#     except Exception as e:
#         logger.exception(f"Error fetching notifications: {e}")
#         return jsonify({"error": "Internal server error"}), 500

# @push_notification_bp.route('/delete', methods=['POST'])
# def delete_notification():
#     try:
#         data = request.json
#         notification_id = data.get('notification_id')
#         user_id = data.get('user_id')

#         if not (notification_id and user_id):
#             logger.warning("Missing required fields: notification_id or user_id.")
#             return jsonify({"error": "Missing required fields"}), 400

#         # کد برای حذف نوتیفیکیشن
#         # فرض کنید delete_notification یک تابع برای حذف نوتیفیکیشن از دیتابیس است
#         success, message = delete_notification_from_db(notification_id, user_id)
#         if success:
#             logger.info(f"Notification deleted successfully for user_id: {user_id}")
#             return jsonify({"message": message}), 200
#         else:
#             logger.error(f"Failed to delete notification for user_id: {user_id}. Message: {message}")
#             return jsonify({"error": message}), 500
#     except Exception as e:
#         logger.exception(f"Error deleting notification: {e}")
#         return jsonify({"error": "Internal server error"}), 500

# def get_notifications(user_id):
#     """
#     دریافت نوتیفیکیشن‌های کاربر از دیتابیس
#     """
#     try:
#         query = text("""
#         SELECT * FROM Notifications WHERE UserID = :user_id
#         """)
#         result = db.session.execute(query, {"user_id": user_id}).fetchall()
#         notifications = [dict(row) for row in result]  # تبدیل نتیجه به لیست دیکشنری
#         return notifications
#     except Exception as e:
#         logger.error(f"Error fetching notifications: {e}", exc_info=True)
#         raise e

# def delete_notification_from_db(notification_id, user_id):
#     """
#     حذف نوتیفیکیشن از دیتابیس
#     """
#     try:
#         query = text("""
#         DELETE FROM Notifications WHERE NotificationID = :notification_id AND UserID = :user_id
#         """)
#         db.session.execute(query, {"notification_id": notification_id, "user_id": user_id})
#         db.session.commit()
#         return True, "Notification deleted successfully."
#     except Exception as e:
#         logger.error(f"Error deleting notification: {e}", exc_info=True)
#         db.session.rollback()
#         return False, f"Error deleting notification: {e}"