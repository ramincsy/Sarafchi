from flask import Blueprint, request, jsonify
from app import db  # استفاده از نمونه مشترک
from sqlalchemy import text
import json
import traceback

test_save_inquiry_bp = Blueprint('test_save_inquiry', __name__)

@app.route('/test-db-connection', methods=['GET'])
def test_db_connection():
    try:
        db.session.execute('SELECT 1')  # اجرای یک کوئری ساده
        return jsonify({"success": True, "message": "Database connection is working"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@test_save_inquiry_bp.route('/test-save-inquiry', methods=['POST'])
def test_save_inquiry():
    try:
        data = request.json
        inquiry_type = data.get('inquiry_type', 'Test Inquiry')
        request_params = data.get('request_params', '{}')
        response_data = data.get('response_data', '{}')
        iban = data.get('iban', None)
        bank_name = data.get('bank_name', None)
        owner_name = data.get('owner_name', None)
        status = data.get('status', None)

        with db.session.begin():
            db.session.execute(text("""
                EXEC spSaveInquiry 
                    @InquiryType=:inquiry_type, 
                    @RequestParams=:request_params, 
                    @ResponseData=:response_data, 
                    @IBAN=:iban, 
                    @BankName=:bank_name, 
                    @OwnerName=:owner_name, 
                    @Status=:status
            """), {
                "inquiry_type": inquiry_type,
                "request_params": json.dumps(request_params),
                "response_data": json.dumps(response_data),
                "iban": iban,
                "bank_name": bank_name,
                "owner_name": owner_name,
                "status": status
            })

        return jsonify({"success": True, "message": "Inquiry saved successfully"}), 201
    except Exception as e:
        print("Error:", str(e))
        print("Traceback:", traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500
