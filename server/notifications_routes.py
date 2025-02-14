from flask import Blueprint, request, jsonify
from user_models import db, Notification
from functools import wraps

# ایجاد Blueprint
notifications_bp = Blueprint('notifications', __name__)

# دکوراتور برای مدیریت خطاها
def handle_errors(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            print(f"Error in {f.__name__}: {e}")  # لاگ خطا
            return jsonify({"error": str(e)}), 500
    return wrapper

@notifications_bp.route('/notifications/send', methods=['POST'])
@handle_errors
def send_notification():
    data = request.json
    user_id = data.get('user_id')
    title = data.get('title')
    message = data.get('message')
    notif_type = data.get('type', 'general')

    if not (user_id and title and message):
        return jsonify({"error": "Missing required fields"}), 400

    new_notification = Notification(
        UserID=user_id,
        Title=title,
        Message=message,
        Type=notif_type
    )
    db.session.add(new_notification)
    db.session.commit()

    return jsonify({
        "NotificationID": new_notification.NotificationID,  # ارسال شناسه ایجاد شده
        "Timestamp": new_notification.Timestamp.isoformat()
    }), 201

@notifications_bp.route('/notifications', methods=['GET'])
@handle_errors
def get_notifications():
    user_id = request.args.get('user_id')  # دریافت user_id از query parameters
    print(f"Fetching notifications for user_id: {user_id}")  # لاگ ورودی

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    notifications = Notification.query.filter_by(UserID=user_id).order_by(Notification.Timestamp.desc()).all()
    print(f"Fetched notifications: {notifications}")  # لاگ خروجی

    # تبدیل نتایج به دیکشنری
    notifications_list = []
    for notification in notifications:
        notifications_list.append({
            "NotificationID": notification.NotificationID,
            "Title": notification.Title,
            "Message": notification.Message,
            "IsRead": notification.IsRead,
            "Timestamp": notification.Timestamp.isoformat(),  # تبدیل تاریخ به رشته
            "Type": notification.Type
        })

    return jsonify(notifications_list), 200
@notifications_bp.route('/notifications/mark-read', methods=['POST'])
@handle_errors
def mark_notifications_read():
    data = request.json
    print(f"Received data for mark_notifications_read: {data}")  # لاگ ورودی

    notification_ids = data.get('notification_ids', [])
    user_id = data.get('user_id')  # دریافت user_id از درخواست

    if not notification_ids:
        return jsonify({"error": "No notifications specified"}), 400

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    Notification.query.filter(
        Notification.NotificationID.in_(notification_ids),
        Notification.UserID == user_id
    ).update({"IsRead": True}, synchronize_session=False)
    db.session.commit()

    print(f"Marked notifications as read: {notification_ids}")  # لاگ موفقیت
    return jsonify({"message": "Notifications marked as read"}), 200
@notifications_bp.route('/notifications/delete', methods=['POST'])
@handle_errors
def delete_notification():
    data = request.json
    print(f"Received data for delete_notification: {data}")  # لاگ ورودی

    notification_id = data.get('notification_id')
    user_id = data.get('user_id')  # دریافت user_id از درخواست

    # بررسی اعتبار داده‌های ورودی
    if not notification_id:
        return jsonify({"error": "Notification ID is required"}), 400

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        notification = Notification.query.filter_by(
            NotificationID=notification_id,
            UserID=user_id
        ).first()
        if not notification:
            print(f"Notification not found for ID {notification_id} and User {user_id}")
            return jsonify({"error": "Notification not found"}), 404

        db.session.delete(notification)
        db.session.commit()

        print(f"Notification deleted: {notification_id}")  # لاگ موفقیت
        return jsonify({"message": "Notification deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting notification: {str(e)}")
        return jsonify({"error": "An error occurred while deleting the notification"}), 500
