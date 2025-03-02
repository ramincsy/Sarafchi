# balances_routes.py
from flask import Blueprint, jsonify
from user_models import db
from sqlalchemy import text

balances_bp = Blueprint('balances_bp', __name__)

@balances_bp.route('/balances/<int:user_id>', methods=['GET'])
def get_user_balances(user_id):
    try:
        # اجرای استور پروسیجر spGetUserBalances
        result = db.session.execute(
            text("EXEC spGetUserBalances @UserID = :uid"),
            {"uid": user_id}
        )
        rows = result.fetchall()

        # لیست نهایی شامل داده‌های خام هر ارز
        balances_list = []
        for row in rows:
            # اگر همه ستون‌ها وجود داشته باشد، آنها را در خروجی قرار می‌دهیم
            balances_list.append({
                "UserID": row.UserID,
                "CurrencyType": row.CurrencyType,
                "Balance": float(row.Balance),
                "WithdrawableBalance": float(row.WithdrawableBalance),
                "Debt": float(row.Debt),
                "Credit": float(row.Credit),
                "LoanAmount": float(row.LoanAmount),
                "LockedBalance": float(row.LockedBalance),
                # اگر LastUpdatedBalance نال نباشد آن را در قالب ISO8601 برمی‌گردانیم
                "LastUpdatedBalance": (
                    row.LastUpdatedBalance.isoformat() 
                    if row.LastUpdatedBalance else None
                )
            })

        # اینجا نیازی به summary یا محاسبه نیست، پس فقط balances را برمی‌گردانیم
        return jsonify({
            "success": True,
            "balances": balances_list
        }), 200

    except Exception as e:
        # درصورت خطا، پیام را در خروجی می‌فرستیم
        return jsonify({"success": False, "error": str(e)}), 500
