from flask_cors import CORS  # type: ignore
from flask_sqlalchemy import SQLAlchemy  # type: ignore
from flask_marshmallow import Marshmallow  # type: ignore
from user_routes import user_bp
from balances_routes import balances_bp  # مسیر فایل Blueprint
from transactions_routes import transactions_bp  # Import تراکنش‌ها
from flask import Flask, request, jsonify  # type: ignore
from flask_jwt_extended import JWTManager, verify_jwt_in_request, get_jwt_identity, set_access_cookies, set_refresh_cookies, unset_jwt_cookies  # type: ignore
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean  # type: ignore
from user_models import db, ma
import requests  # type: ignore
from bs4 import BeautifulSoup  # type: ignore
from sqlalchemy import text  # type: ignore
import traceback
from exchange_prices_routes import exchange_prices_bp
import os
from inquiry_jibit import jibit_bp
from sqlalchemy import text  # type: ignore
from withdrawals_routes import withdrawals_bp
from roles_permissions_routes import roles_permissions_bp
from page_routes import page_bp
from live_price_routes import live_price_bp
from token_utils import token_bp
from datetime import datetime, timedelta
from trx_wallet_routes import trx_wallet_bp  # اضافه کردن این خط
from get_balance_usdt import balances_bp2
from deposits import deposits_bp
from notifications_routes import notifications_bp
from user_models import db, Notification
from push_notification_routes import push_notification_bp

app = Flask(__name__)
CORS(app, supports_credentials=True)


app.config['SQLALCHEMY_DATABASE_URI'] = 'mssql+pyodbc://@localhost/sarafchi-DB?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_secret_key_here'


os.environ["API_KEY"] = "SuRs2Cuz8c"
os.environ["SECRET_KEY"] = "IpV58LOVQDNouNNT_uCpwFMaE"

db.init_app(app)
ma.init_app(app)
jwt = JWTManager(app)

app.register_blueprint(user_bp, url_prefix="/api")
# تنظیم URL prefix برای تمام مسیرهای Blueprint
app.register_blueprint(balances_bp, url_prefix='/api')
# Register تراکنش‌ها
app.register_blueprint(transactions_bp, url_prefix="/api")
app.register_blueprint(exchange_prices_bp, url_prefix="/api")
app.register_blueprint(jibit_bp, url_prefix='/api/jibit')
app.register_blueprint(withdrawals_bp, url_prefix="/api/withdrawals")
app.register_blueprint(page_bp, url_prefix='/api')
app.register_blueprint(roles_permissions_bp,
                       url_prefix='/api/RolesPermissionsManager')
app.register_blueprint(live_price_bp)
app.register_blueprint(token_bp, url_prefix='/api')
app.register_blueprint(trx_wallet_bp, url_prefix='/api')
app.register_blueprint(balances_bp2, url_prefix='/api')
app.register_blueprint(deposits_bp, url_prefix="/api")
app.register_blueprint(notifications_bp, url_prefix="/api")
app.register_blueprint(push_notification_bp)

@app.route('/test-db-connection', methods=['GET'])
def test_db_connection():
    try:
        # اجرای یک کوئری ساده برای بررسی اتصال به دیتابیس
        db.session.execute(text('SELECT 1'))
        return jsonify({"success": True, "message": "Database connection is working"}), 200
    except Exception as e:
        # در صورت وقوع خطا، پیام خطا را برگردانید
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/notifications/save-token', methods=['POST'])
def save_token():
    """
    API برای ذخیره توکن دستگاه کاربر
    """
    data = request.json
    user_id = data.get('user_id')
    token = data.get('token')

    if not (user_id and token):
        return jsonify({"error": "Missing required fields"}), 400

    # ذخیره توکن کاربر
    if save_user_token(user_id, token):
        return jsonify({"message": "Token saved successfully"}), 200
    else:
        return jsonify({"error": "Failed to save token"}), 500

@app.route('/api/notifications/send', methods=['POST'])
def send_notification():
    """
    API برای ارسال نوتیفیکیشن به کاربر
    """
    data = request.json
    user_id = data.get('user_id')
    title = data.get('title')
    message = data.get('message')

    if not (user_id and title and message):
        return jsonify({"error": "Missing required fields"}), 400

    # ارسال نوتیفیکیشن به کاربر
    success, response = send_notification_to_user(user_id, title, message)

    if success:
        return jsonify({"message": "Notification sent successfully", "details": response}), 200
    else:
        return jsonify({"error": "Failed to send notification", "details": response}), 500

@app.route('/api/notifications/update-token', methods=['POST'])
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

if __name__ == '__main__':
    app.run(debug=True)
