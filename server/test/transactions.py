from flask import Blueprint, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import datetime

# تعریف Blueprint
transactions_bp = Blueprint('transactions', __name__)

# تعریف SQLAlchemy و Marshmallow
db = SQLAlchemy()
ma = Marshmallow()

# مدل تراکنش (همگام با جدول موجود)
class Transactions(db.Model):
    __tablename__ = "transactions"
    TransactionID = db.Column(db.Integer, primary_key=True)
    TransactionDateTime = db.Column(db.DateTime, default=datetime.datetime.now)
    UserID = db.Column(db.Integer, nullable=False)
    Quantity = db.Column(db.Float, nullable=False)
    Price = db.Column(db.Float, nullable=False)
    TransactionType = db.Column(db.String(50), nullable=False)
    Position = db.Column(db.String(50), nullable=False)
    Status = db.Column(db.String(50), nullable=False)
    CurrencyType = db.Column(db.String(50), nullable=False)
    Description = db.Column(db.Text)
    CreatedBy = db.Column(db.String(100), nullable=False)

# اسکیما برای سریالایز کردن داده‌ها
class TransactionSchema(ma.Schema):
    class Meta:
        fields = (
            'TransactionID', 'TransactionDateTime', 'UserID', 'Quantity',
            'Price', 'TransactionType', 'Position', 'Status', 
            'CurrencyType', 'Description', 'CreatedBy'
        )

transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)

# مسیرهای API
@transactions_bp.route('/transactions', methods=['POST'])
def create_transaction():
    data = request.get_json()
    new_transaction = Transactions(
        UserID=data['UserID'],
        Quantity=data['Quantity'],
        Price=data['Price'],
        TransactionType=data['TransactionType'],
        Position=data['Position'],
        Status=data['Status'],
        CurrencyType=data['CurrencyType'],
        Description=data.get('Description', ''),
        CreatedBy=data['CreatedBy']
    )
    db.session.add(new_transaction)
    db.session.commit()
    return transaction_schema.jsonify(new_transaction), 201

@transactions_bp.route('/transactions', methods=['GET'])
def get_transactions():
    all_transactions = Transactions.query.all()
    result = transactions_schema.dump(all_transactions)
    return jsonify(result)

@transactions_bp.route('/transactions/<int:id>', methods=['GET'])
def get_transaction(id):
    transaction = Transactions.query.get_or_404(id)
    return transaction_schema.jsonify(transaction)

@transactions_bp.route('/transactions/<int:id>', methods=['PUT'])
def update_transaction(id):
    transaction = Transactions.query.get_or_404(id)
    data = request.get_json()
    transaction.UserID = data.get('UserID', transaction.UserID)
    transaction.Quantity = data.get('Quantity', transaction.Quantity)
    transaction.Price = data.get('Price', transaction.Price)
    transaction.TransactionType = data.get('TransactionType', transaction.TransactionType)
    transaction.Position = data.get('Position', transaction.Position)
    transaction.Status = data.get('Status', transaction.Status)
    transaction.CurrencyType = data.get('CurrencyType', transaction.CurrencyType)
    transaction.Description = data.get('Description', transaction.Description)
    transaction.CreatedBy = data.get('CreatedBy', transaction.CreatedBy)
    db.session.commit()
    return transaction_schema.jsonify(transaction)

@transactions_bp.route('/transactions/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    transaction = Transactions.query.get_or_404(id)
    db.session.delete(transaction)
    db.session.commit()
    return jsonify({'message': 'Transaction deleted successfully'}), 200
