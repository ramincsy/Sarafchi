import requests
import json
from flask import Blueprint, request, jsonify
from sqlalchemy import text
from datetime import datetime
from user_models import db

# تنظیمات
BASE_URL = "https://napi.jibit.ir/ide/v1"
API_KEY = "SuRs2Cuz8c"
SECRET_KEY = "IpV58LOVQDNouNNT_uCpwFMaE"

# ایجاد Blueprint
jibit_bp = Blueprint('jibit', __name__, url_prefix='/api/jibit')

# ---------------------- مدل دیتابیس ----------------------
class InquiryResult(db.Model):
    __tablename__ = 'inquiries'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    inquiry_type = db.Column(db.String(50), nullable=False)
    card_number = db.Column(db.String(20))
    iban = db.Column(db.String(34))
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    status = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# ---------------------- توابع Jibit ----------------------

def generate_access_token():
    """ایجاد توکن دسترسی."""
    url = f"{BASE_URL}/tokens/generate"
    headers = {"Content-Type": "application/json"}
    payload = {"apiKey": API_KEY, "secretKey": SECRET_KEY}
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            data = response.json()
           
            return data.get("accessToken")
        else:
            
            return None
    except Exception as e:
       
        return None

def send_get_request(endpoint, access_token, params=None):
    """ارسال درخواست GET به Jibit API."""
    url = f"{BASE_URL}/{endpoint}"
    headers = {"Authorization": f"Bearer {access_token}"}
    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            print(f"Request to {endpoint} successful")
            return response.json()
        else:
            print(f"Error in request to {endpoint}: {response.status_code}")
            return None
    except Exception as e:
        print(f"Exception occurred while requesting {endpoint}:", e)
        return None

def save_to_database_with_sp(user_id, inquiry_type, card_number, response_data):
    """ذخیره داده‌ها با استفاده از Stored Procedure."""
    iban = response_data.get("ibanInfo", {}).get("iban")
    owners = response_data.get("ibanInfo", {}).get("owners", [])
    first_name = owners[0].get("firstName", "") if owners else None
    last_name = owners[0].get("lastName", "") if owners else None
    status = response_data.get("ibanInfo", {}).get("status")

    try:
         # بررسی وضعیت تراکنش فعلی
        if db.session.is_active:
            db.session.rollback()  # در صورت وجود تراکنش باز، آن را برمی‌گرداند

        with db.session.begin():
            db.session.execute(text("""
                EXEC spSaveInquiry 
                    @UserID=:user_id, 
                    @InquiryType=:inquiry_type, 
                    @CardNumber=:card_number, 
                    @IBAN=:iban, 
                    @FirstName=:first_name, 
                    @LastName=:last_name, 
                    @Status=:status
            """), {
                "user_id": user_id,
                "inquiry_type": inquiry_type,
                "card_number": card_number,
                "iban": iban,
                "first_name": first_name,
                "last_name": last_name,
                "status": status
            })
            print(f"Inquiry saved successfully: {inquiry_type}")
    except Exception as e:
        db.session.rollback()  # در صورت خطا تراکنش را برمی‌گرداند
        print(f"Error saving inquiry: {str(e)}")
        raise

# ---------------------- API‌های Flask ----------------------
@jibit_bp.route('/iban-inquiry', methods=['GET'])
def iban_inquiry():
    """استعلام شبا."""
    user_id = request.args.get('user_id')
    iban = request.args.get('iban')

    # بررسی الزامی بودن پارامترها
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    if not iban:
        return jsonify({"error": "IBAN is required"}), 400

    try:
        # جستجوی شماره شبا در دیتابیس
        existing_data = db.session.execute(
            text("""
                SELECT iban, first_name, last_name, status 
                FROM inquiries 
                WHERE inquiry_type = 'IBAN Inquiry' AND iban = :iban
            """),
            {"iban": iban}
        ).fetchone()

        if existing_data:
            # بازگشت داده‌های کش شده
           
            return jsonify({
                "iban": existing_data.iban,
                "bank_info": {
                    "first_name": existing_data.first_name,
                    "last_name": existing_data.last_name,
                    "full_name": f"{existing_data.first_name} {existing_data.last_name}",
                    "status": existing_data.status
                }
            })

        # در غیر این صورت، درخواست به API ارسال شود
       
        access_token = generate_access_token()
        if not access_token:
            return jsonify({"error": "Failed to generate access token"}), 500

        # ارسال درخواست به Jibit API
        result = send_get_request(f"ibans?value={iban}", access_token)
        if result:
            # ذخیره اطلاعات دریافتی در دیتابیس
            save_to_database_with_sp(user_id, "IBAN Inquiry", None, result)
            
            # بازگشت داده‌ها
            return jsonify({
                "iban": result.get("value"),
                "bank_info": result.get("ibanInfo", {})
            })
        else:
            return jsonify({"error": "Failed to fetch IBAN inquiry"}), 500

    except Exception as e:
        print(f"Error during IBAN inquiry: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@jibit_bp.route('/card-to-iban', methods=['GET'])
def card_to_iban():
    """تبدیل کارت به شبا."""
    user_id = request.args.get('user_id')
    card_number = request.args.get('card_number')

    # بررسی الزامی بودن پارامترها
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    if not card_number:
        return jsonify({"error": "Card number is required"}), 400

    # بررسی اطلاعات در دیتابیس
    existing_data = db.session.execute(
        text("SELECT * FROM inquiries WHERE inquiry_type='Card to IBAN' AND card_number=:card_number"),
        {"card_number": card_number}
    ).fetchone()

    if existing_data:
        # اگر داده موجود باشد، نتیجه را باز می‌گرداند
       
        return jsonify({
            "card_number": existing_data.card_number,
            "iban_info": {
                "iban": existing_data.iban,
                "first_name": existing_data.first_name,
                "last_name": existing_data.last_name,
                "full_name": f"{existing_data.first_name} {existing_data.last_name}",  # اضافه کردن نام کامل
                "status": existing_data.status
    }
})


    # در غیر این صورت، درخواست به API ارسال می‌شود
 
    access_token = generate_access_token()
    if not access_token:
        return jsonify({"error": "Failed to generate access token"}), 500

    result = send_get_request(f"cards?number={card_number}&iban=true", access_token)
    if result:
        try:
            save_to_database_with_sp(user_id, "Card to IBAN", card_number, result)
        except Exception as e:
            return jsonify({"error": f"Database error: {str(e)}"}), 500

        return jsonify({
            "card_number": result.get("number"),
            "iban_info": result.get("ibanInfo", {})
        })
    else:
        return jsonify({"error": "Failed to fetch Card to IBAN inquiry"}), 500
