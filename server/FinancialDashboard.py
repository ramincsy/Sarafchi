from flask import Blueprint, jsonify, request
from sqlalchemy.sql import text
from user_models import db
from functools import wraps

financial_dashboard_bp = Blueprint('financial_dashboard', __name__)

# Decorator for authentication (example)
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"success": False, "error": "Token is missing!"}), 401
        # Add your token validation logic here
        return f(*args, **kwargs)
    return decorated

@financial_dashboard_bp.route('/api/financial-dashboard/overview', methods=['GET'])
def get_dashboard_overview():
    """
    API: دریافت اطلاعات کلی موجودی کاربران و کیف پول صرافی
    """
    try:
        # Query user balances
        user_balances_query = """
        SELECT CurrencyType, SUM(Debit - Credit - LockedBalance - LoanBalance) AS TotalBalance
        FROM UserBalances
        WHERE CurrencyType IN ('Toman', 'USDT', 'ir', 'EUR', 'USD')
        GROUP BY CurrencyType
        """
        user_balances_result = db.session.execute(text(user_balances_query)).fetchall()
        user_balances = [{"currencyType": row.CurrencyType, "totalBalance": row.TotalBalance} for row in user_balances_result]

        # Query exchange balances
        exchange_balances_query = """
        SELECT CurrencyType, SUM(Balance - LockedBalance) AS TotalBalance
        FROM Wallets_USDT
        WHERE CurrencyType IN ('Toman', 'USDT', 'ir', 'EUR', 'USD')
        GROUP BY CurrencyType
        """
        exchange_balances_result = db.session.execute(text(exchange_balances_query)).fetchall()
        exchange_balances = [{"currencyType": row.CurrencyType, "totalBalance": row.TotalBalance} for row in exchange_balances_result]

        # Calculate discrepancies
        discrepancies = []
        for user_balance in user_balances:
            exchange_balance = next(
                (e for e in exchange_balances if e["currencyType"] == user_balance["currencyType"]),
                {"totalBalance": 0}
            )
            discrepancies.append({
                "currencyType": user_balance["currencyType"],
                "userBalance": user_balance["totalBalance"],
                "exchangeBalance": exchange_balance["totalBalance"],
                "difference": user_balance["totalBalance"] - exchange_balance["totalBalance"]
            })

        return jsonify({
            "userBalances": user_balances,
            "exchangeBalances": exchange_balances,
            "discrepancies": discrepancies
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@financial_dashboard_bp.route('/api/financial-dashboard/logs', methods=['GET'])
def get_balance_logs():
    """
    API: دریافت لاگ تغییرات موجودی
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 100, type=int)

        logs_query = """
        SELECT * FROM BalanceLogs
        ORDER BY ActionDateTime DESC
        OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
        """
        logs_result = db.session.execute(text(logs_query), {'offset': (page - 1) * per_page, 'limit': per_page}).fetchall()
        logs = [dict(row._mapping) for row in logs_result]
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@financial_dashboard_bp.route('/api/financial-dashboard/transactions', methods=['GET'])
def get_transactions():
    """
    API: دریافت تراکنش‌های اخیر
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 100, type=int)

        transactions_query = """
        SELECT * FROM Transactions
        ORDER BY TransactionDateTime DESC
        OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
        """
        transactions_result = db.session.execute(text(transactions_query), {'offset': (page - 1) * per_page, 'limit': per_page}).fetchall()
        transactions = [dict(row._mapping) for row in transactions_result]
        return jsonify(transactions), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@financial_dashboard_bp.route('/api/financial-dashboard/balance-monitor', methods=['GET'])
def balance_monitor():
    """
    API: مانیتورینگ موجودی کاربران و کیف پول صرافی
    """
    try:
        query = """
        SELECT
            ub.CurrencyType,
            ub.TotalUserBalance,
            wb.TotalWalletBalance,
            (ub.TotalUserBalance - wb.TotalWalletBalance) AS Difference
        FROM
            (
                SELECT
                    CurrencyType,
                    SUM(Debit - Credit - LockedBalance - LoanBalance) AS TotalUserBalance
                FROM UserBalances
                WHERE CurrencyType IN ('Toman', 'USDT', 'ir', 'EUR', 'USD')
                GROUP BY CurrencyType
            ) AS ub
        LEFT JOIN
            (
                SELECT
                    CurrencyType,
                    SUM(Balance - LockedBalance) AS TotalWalletBalance
                FROM Wallets_USDT
                WHERE CurrencyType IN ('Toman', 'USDT', 'ir', 'EUR', 'USD')
                GROUP BY CurrencyType
            ) AS wb
        ON ub.CurrencyType = wb.CurrencyType;
        """
        result = db.session.execute(text(query)).fetchall()
        balances = [
            {
                "currencyType": row.CurrencyType,
                "userBalance": row.TotalUserBalance,
                "walletBalance": row.TotalWalletBalance,
                "difference": row.Difference
            }
            for row in result
        ]
        return jsonify({"balances": balances}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500