from flask import Blueprint, jsonify  # type: ignore
from user_models import db
from sqlalchemy import text  # type: ignore

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

        # متغیرها برای جمع‌آوری اطلاعات کلی
        total_net_balance = 0
        total_withdrawable_balance = 0
        total_locked_balance = 0

        # ساختار داده‌ها
        balances = []
        for row in rows:
            net_balance = float(row.NetBalance)
            withdrawable_balance = float(row.WithdrawableBalance)
            locked_balance = float(row.LockedBalance)

            # اضافه کردن اطلاعات به ساختار کلی
            total_net_balance += net_balance
            total_withdrawable_balance += withdrawable_balance
            total_locked_balance += locked_balance

            # جزئیات هر ارز
            balances.append({
                "CurrencyType": row.CurrencyType,
                "Debit": float(row.Debit),
                "Credit": float(row.Credit),
                "NetBalance": net_balance,
                "WithdrawableBalance": withdrawable_balance,
                "LockedBalance": locked_balance,
                "LoanBalance": float(row.LoanBalance),
                "LastUpdatedBalance": row.LastUpdatedBalance.isoformat(),
            })

        # بازگرداندن اطلاعات
        return jsonify({
            "success": True,
            "summary": {
                "total_net_balance": total_net_balance,
                "total_withdrawable_balance": total_withdrawable_balance,
                "total_locked_balance": total_locked_balance
            },
            "balances": balances
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
