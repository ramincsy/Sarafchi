from flask import Blueprint, request, jsonify
from push_notification_manager import save_user_token, send_notification_to_user, update_user_token

# ایجاد Blueprint برای Push Notifications
push_notification_bp = Blueprint('push_notification', __name__, url_prefix='/api/push')

@push_notification_bp.route('/save-token', methods=['POST'])
def save_token():
    """
    API برای ذخیره توکن دستگاه کاربر
    """
    try:
        data = request.json
        user_id = data.get('user_id')
        token = data.get('token')

        if not (user_id and token):
            return jsonify({"error": "Missing required fields"}), 400

        if save_user_token(user_id, token):
            return jsonify({"message": "Token saved successfully"}), 200
        else:
            return jsonify({"error": "Failed to save token"}), 500
    except Exception as e:
        print(f"Error in save_token: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@push_notification_bp.route('/send', methods=['POST'])
def send_notification():
    """
    API برای ارسال نوتیفیکیشن به کاربر
    """
    data = request.json
    user_id = data.get('user_id')
    title = data.get('title')
    message = data.get('message')

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    if not title:
        return jsonify({"error": "Title is required"}), 400
    if not message:
        return jsonify({"error": "Message is required"}), 400

    # ارسال نوتیفیکیشن به کاربر
    success, response = send_notification_to_user(user_id, title, message)

    if success:
        return jsonify({"message": "Notification sent successfully", "details": response}), 200
    else:
        return jsonify({"error": "Failed to send notification", "details": response}), 500

@push_notification_bp.route('/update-token', methods=['POST'])
def update_token():
    """
    API برای به‌روزرسانی توکن دستگاه کاربر
    """
    data = request.json
    user_id = data.get('user_id')
    old_token = data.get('old_token')
    new_token = data.get('new_token')

    if not (user_id and old_token and new_token):
        return jsonify({"error": "Missing required fields"}), 400

    # به‌روزرسانی توکن کاربر
    if update_user_token(user_id, old_token, new_token):
        return jsonify({"message": "Token updated successfully"}), 200
    else:
        return jsonify({"error": "Failed to update token"}), 500