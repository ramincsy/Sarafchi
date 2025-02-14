from flask import Blueprint, request, jsonify
from sqlalchemy import text
# from datetime import datetime
from user_models import db, ma
import traceback
from Iran_DateTime import get_iran_time

# تعریف Blueprint برای تراکنش‌ها
transactions_bp = Blueprint('transactions', __name__)

# مدل تراکنش‌ها
class Transaction(db.Model):
    __tablename__ = 'Transactions'
    TransactionID = db.Column(db.Integer, primary_key=True)
    TransactionDateTime = db.Column(db.DateTime, nullable=False, default=get_iran_time())
    UserID = db.Column(db.Integer, nullable=False)
    Quantity = db.Column(db.Float, nullable=False)
    Price = db.Column(db.Float, nullable=False)
    TransactionType = db.Column(db.String(50), nullable=False)
    Position = db.Column(db.String(50), nullable=False)
    Status = db.Column(db.String(50), nullable=False, default='Processing')
    CurrencyType = db.Column(db.String(50), nullable=False)
    Description = db.Column(db.Text, nullable=True)
    CreatedBy = db.Column(db.String(100), nullable=False)

# Schema برای تراکنش‌ها
class TransactionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Transaction

transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)

# ایجاد تراکنش جدید
@transactions_bp.route('/transactions', methods=['POST'])
def create_transaction():
    data = request.json
    transaction_datetime = get_iran_time()
   
    try:
        with db.session.begin():
            result = db.session.execute(text("""
                EXEC spCreateTransaction 
                    @UserID=:UserID, 
                    @Quantity=:Quantity, 
                    @Price=:Price, 
                    @TransactionType=:TransactionType, 
                    @Position=:Position, 
                    @CurrencyType=:CurrencyType, 
                    @Description=:Description, 
                    @CreatedBy=:CreatedBy,
                    @TransactionDateTime=:TransactionDateTime
            """), {
                "UserID": data['UserID'],
                "Quantity": data['Quantity'],
                "Price": data['Price'],
                "TransactionType": data.get('TransactionType', 'معامله پیشنهادی'),
                "Position": data['Position'],
                "CurrencyType": data['CurrencyType'],
                "Description": data.get('Description', None),
                "CreatedBy": data['CreatedBy'],
                "TransactionDateTime": transaction_datetime
            })

            rows = result.fetchall()

        new_id = None
        for row in rows:
            new_id = row.TransactionID

        if new_id:
            new_transaction = Transaction.query.get(new_id)
            return transaction_schema.jsonify(new_transaction), 201
        else:
            return jsonify({"message": "Transaction created but no ID returned"}), 201

    except Exception as e:
       
        return jsonify({"error": str(e)}), 400

# واکشی تمامی تراکنش‌ها
@transactions_bp.route('/transactions', methods=['GET'])
def get_transactions():
    try:
        transactions = Transaction.query.order_by(Transaction.TransactionDateTime.desc()).all()
        return transactions_schema.jsonify(transactions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# تأیید تراکنش
@transactions_bp.route('/transactions/confirm/<int:transaction_id>', methods=['POST'])
def confirm_transaction(transaction_id):
    try:
        print(f"Confirming transaction: {transaction_id}")
        with db.session.begin():
            result = db.session.execute(
                text("EXEC spConfirmTransaction @TransactionID=:transaction_id"),
                {"transaction_id": transaction_id}
            )
           
        return jsonify({"success": True, "message": "Transaction confirmed."}), 200
    except Exception as e:
     
        return jsonify({"success": False, "error": str(e)}), 500


# لغو تراکنش
@transactions_bp.route('/transactions/cancel/<int:transaction_id>', methods=['POST'])
def cancel_transaction(transaction_id):
    try:
        print(f"Attempting to cancel transaction ID: {transaction_id}")
        with db.session.begin():
            result = db.session.execute(
                text("EXEC spCancelTransaction @TransactionID=:transaction_id"),
                {"transaction_id": transaction_id}
            )
            print(f"Rows affected: {result.rowcount}")
        return jsonify({"success": True, "message": "Transaction canceled successfully."}), 200
    except Exception as e:
      
        return jsonify({"success": False, "error": f"SQL Error: {str(e)}"}), 500