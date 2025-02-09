from flask import Blueprint, request, jsonify
from sqlalchemy import text
from user_models import db
# from datetime import datetime
from Iran_DateTime import get_iran_time
# ایجاد Blueprint برای برداشت‌ها
withdrawals_bp = Blueprint('withdrawals', __name__, url_prefix='/api/withdrawals')

# ذخیره اطلاعات برداشت در دیتابیس با Stored Procedure
@withdrawals_bp.route('', methods=['POST'])
def create_withdrawal():
    data = request.json

    # استخراج داده‌ها از درخواست
    user_id = data.get('UserID')
    amount = data.get('Amount')
    currency_type = data.get('CurrencyType')
    card_number = data.get('CardNumber')
    iban = data.get('IBAN')
    wallet_address = data.get('WalletAddress')
    description = data.get('Description')
    status = data.get('Status')
    account_holder_name = data.get('AccountHolderName')
    transfer_source = data.get('TransferSource')
    created_by = data.get('CreatedBy')

    # بررسی الزامی بودن داده‌ها
    if not all([user_id, amount, currency_type, status, created_by]):
        return jsonify({"success": False, "message": "Required fields are missing"}), 400

    try:
        # اجرای Stored Procedure برای ذخیره اطلاعات برداشت
        db.session.execute(
            text("""
                EXEC spInsertWithdrawal 
                    @UserID=:user_id, 
                    @Amount=:amount, 
                    @CurrencyType=:currency_type, 
                    @CardNumber=:card_number, 
                    @IBAN=:iban, 
                    @WalletAddress=:wallet_address, 
                    @WithdrawalDateTime=:withdrawal_date, 
                    @Description=:description, 
                    @Status=:status, 
                    @AccountHolderName=:account_holder_name, 
                    @TransferSource=:transfer_source, 
                    @CreatedBy=:created_by
            """),
            {
                "user_id": user_id,
                "amount": amount,
                "currency_type": currency_type,
                "card_number": card_number,
                "iban": iban,
                "wallet_address": wallet_address,
                "withdrawal_date":  get_iran_time(),
                "description": description,
                "status": status,
                "account_holder_name": account_holder_name,
                "transfer_source": transfer_source,
                "created_by": created_by
            }
        )
        db.session.commit()
        print(get_iran_time())
        return jsonify({"success": True, "message": "Withdrawal created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

# خواندن اطلاعات برداشت از دیتابیس با Stored Procedure

# به‌روزرسانی وضعیت برداشت (تأیید یا لغو)
@withdrawals_bp.route('/<int:withdrawal_id>/status', methods=['POST'])
def update_withdrawal_status(withdrawal_id):
    data = request.json
    status = data.get('Status')  # مقادیر "Approved" یا "Rejected"

    if not status:
        return jsonify({"success": False, "message": "Status is required"}), 400

    try:
        db.session.execute(
            text("EXEC spUpdateWithdrawalStatus @WithdrawalID=:withdrawal_id, @Status=:status"),
            {"withdrawal_id": withdrawal_id, "status": status}
        )
        db.session.commit()
        return jsonify({"success": True, "message": f"Withdrawal {status} successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
@withdrawals_bp.route('', methods=['GET'])
def get_withdrawals():
    try:
        # اجرای Stored Procedure برای خواندن اطلاعات
        result = db.session.execute(text("EXEC spGetWithdrawals"))
        withdrawals = []
        for row in result:
            withdrawals.append({
                "WithdrawalID": row.WithdrawalID,
                "UserID": row.UserID,
                "Amount": row.Amount,
                "CurrencyType": row.CurrencyType,
                "CardNumber": row.CardNumber,
                "IBAN": row.IBAN,
                "WalletAddress": row.WalletAddress,
                "WithdrawalDateTime": row.WithdrawalDateTime.isoformat() if row.WithdrawalDateTime else None,
                "Description": row.Description,
                "Status": row.Status,
                "AccountHolderName": row.AccountHolderName,
                "TransferSource": row.TransferSource,
                "CreatedBy": row.CreatedBy
            })
        return jsonify({"success": True, "data": withdrawals}), 200
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return jsonify({"success": False, "error": str(e), "details": error_details}), 500
