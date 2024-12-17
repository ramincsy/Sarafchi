
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from user_routes import user_bp
<<<<<<< HEAD
from balances_routes import balances_bp  # مسیر فایل Blueprint
from transactions_routes import transactions_bp  # Import تراکنش‌ها
=======
from balances_routes import balances_bp
from transactions_routes import transactions_bp  
>>>>>>> 06f15ecdc9cb010569aff8b442bbbd9fe1924bb8
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager , jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from user_models import db, ma  
import requests
from bs4 import BeautifulSoup
from sqlalchemy import text
import traceback
from exchange_prices_routes import exchange_prices_bp
import os
from inquiry_jibit import jibit_bp
from sqlalchemy import text
from withdrawals_routes import withdrawals_bp


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

app.register_blueprint(user_bp, url_prefix="/")
app.register_blueprint(balances_bp, url_prefix='/api')  # تنظیم URL prefix برای تمام مسیرهای Blueprint
app.register_blueprint(transactions_bp, url_prefix="/api")  # Register تراکنش‌ها
app.register_blueprint(exchange_prices_bp, url_prefix="/api")
app.register_blueprint(jibit_bp, url_prefix='/api/jibit')
app.register_blueprint(withdrawals_bp, url_prefix="/api/withdrawals")

@app.route('/api/live-price', methods=['GET'])
def get_live_price():
    try:
        html = requests.get("https://abantether.com/coin/USDT")
        soup = BeautifulSoup(html.text, 'html.parser')
        target_div = soup.find('div', class_='Body_row__ta6o9')
        if target_div:
            buyPrice = target_div.find('p', class_='text-salte-900 text-[salte-900] Text_nowrap__5jEFO Text_title-small__8t9nb undefined').get_text()
            price = int(buyPrice.replace(',', ''))
            return jsonify({"success": True, "price": price}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/test-db-connection', methods=['GET'])
def test_db_connection():
    try:
        # اجرای یک کوئری ساده برای بررسی اتصال به دیتابیس
        db.session.execute(text('SELECT 1'))
        return jsonify({"success": True, "message": "Database connection is working"}), 200
    except Exception as e:
        # در صورت وقوع خطا، پیام خطا را برگردانید
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
