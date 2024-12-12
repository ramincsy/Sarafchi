from flask import Blueprint, jsonify
from user_models import db
from sqlalchemy import text

balances_bp = Blueprint('balances_bp', __name__)


@balances_bp.route('/balances/<int:user_id>', methods=['GET'])
def get_user_balances(user_id):
    try:
        # فراخوانی استور پروسیجر
        result = db.session.execute(
            text("EXEC spGetUserBalances @UserID = :uid"),
            {"uid": user_id}
        )
        rows = result.fetchall()

        balances = {}
        for row in rows:
            currency = row.CurrencyType
            balance = row.Balance
            balances[currency] = float(balance)

        return jsonify(balances), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
