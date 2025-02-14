from flask_cors import CORS  # type: ignore
from flask_sqlalchemy import SQLAlchemy  # type: ignore
from flask_marshmallow import Marshmallow  # type: ignore
from user_routes import user_bp
from balances_routes import balances_bp  # مسیر فایل Blueprint
from transactions_routes import transactions_bp  # Import تراکنش‌ها
from flask import Flask, request, jsonify, send_from_directory  # type: ignore
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
from trx_wallet_routes import trx_wallet_bp  
from get_balance_usdt import balances_bp2
from deposits import deposits_bp
from notifications_routes import notifications_bp
from user_models import db, Notification
from push_notification_manager import push_notification_bp  # تغییر این خط
from usdt_withdrawals_routes import usdt_withdrawals_bp
from FinancialDashboard import financial_dashboard_bp
from Iran_DateTime import get_iran_time

build_folder = r'C:\inetpub\wwwroot\sarafchi'

app = Flask(__name__, static_folder=build_folder, static_url_path='')
# CORS(app, supports_credentials=True, resources={
#     r"/api/*": {
#         "origins": ["http://localhost:3000", "https://06ab-2a0d-3344-303d-b910-dc0a-e544-8900-e988.ngrok-free.app"]
#     }
# })

CORS(app, supports_credentials=True, static_folder=build_folder, static_url_path='' ,resources={r"/*": {"origins": "*"}})



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
app.register_blueprint(push_notification_bp, url_prefix="/api/push")
app.register_blueprint(usdt_withdrawals_bp)
app.register_blueprint(financial_dashboard_bp)

@app.route('/test-db-connection', methods=['GET'])
def test_db_connection():
    try:
        # اجرای یک کوئری ساده برای بررسی اتصال به دیتابیس
        db.session.execute(text('SELECT 1'))
        return jsonify({"success": True, "message": "Database connection is working"}), 200
    except Exception as e:
        # در صورت وقوع خطا، پیام خطا را برگردانید
        return jsonify({"success": False, "error": str(e)}), 500

@app.before_request
def handle_options_request():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        response.headers["Access-Control-Allow-Origin"] = request.headers.get("Origin", "*")
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    

# اضافه کردن endpoint جهت ارسال زمان رسمی تهران به فرانت‌اند
@app.route('/api/get_iran_time', methods=['GET'])
def get_iran_time_endpoint():
    try:
        current_time = get_iran_time()
        # فرمت کردن زمان به صورت رشته به فرم "YYYY-MM-DD HH:mm:ss+03:30"
        formatted_time = current_time.isoformat(' ')
        return jsonify({"currentTime": formatted_time})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # اگر فایل درخواست شده وجود داشته باشد، آن را سرو می‌کند
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # در غیر این صورت، فایل index.html را باز می‌گرداند
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
