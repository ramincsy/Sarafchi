# equality_data_routes.py
from flask import Blueprint, jsonify
from sqlalchemy import text
from user_models import db
from datetime import datetime

equality_bp = Blueprint('equality_bp', __name__)

def transform_equality_data(raw_data):
    """
    raw_data به شکل زیر است (هر سطر):
    {
      "UserID": 8,
      "FirstName": "Ali",
      "LastName": "Rezayi",
      "Email": "ali.rezayi@example.com",
      "RoleID": 21,
      "RoleName": "Super Admin",
      "CurrencyType": "Toman",
      "Balance": 1000000.0,
      "Debt": 0.0,
      "Credit": 0.0,
      "LoanAmount": 0.0,
      "LockedBalance": 0.0,
      "WithdrawableBalance": 1000000.0,
      "LastUpdatedBalance": "2025-03-08T10:42:09.833000"
      ...
    }
    داده‌ها می‌تواند تکراری باشد (کاربر چند نقش/چند ارز).
    """

    users_map = {}  # key=user_id => dict با فیلدهای کاربر

    for row in raw_data:
        user_id = row["UserID"]

        if user_id not in users_map:
            users_map[user_id] = {
                "UserID": user_id,
                "FirstName": row.get("FirstName"),
                "LastName": row.get("LastName"),
                "Email": row.get("Email"),
                "roles": set(),       # از set استفاده می‌کنیم تا نقش تکراری وارد نشود
                "balances": []
            }

        # افزودن نقش (اگر RoleName خالی نباشد)
        role_name = row.get("RoleName")
        if role_name:
            users_map[user_id]["roles"].add(role_name)

        # اگر CurrencyType خالی نباشد، پس رکورد مربوط به موجودی است
        ctype = row.get("CurrencyType")
        if ctype:
            balance_obj = {
                "CurrencyType": ctype,
                "Balance": float(row.get("Balance", 0)),
                "Debt": float(row.get("Debt", 0)),
                "Credit": float(row.get("Credit", 0)),
                "LoanAmount": float(row.get("LoanAmount", 0)),
                "LockedBalance": float(row.get("LockedBalance", 0)),
                "WithdrawableBalance": float(row.get("WithdrawableBalance", 0)),
                "LastUpdatedBalance": row.get("LastUpdatedBalance")
            }
            users_map[user_id]["balances"].append(balance_obj)

    # تبدیل به لیست و مرتب‌سازی نقش‌ها
    final_list = []
    for user_id, info in users_map.items():
        # تبدیل set نقش‌ها به لیست
        info["roles"] = sorted(list(info["roles"]))
        final_list.append(info)

    return final_list


@equality_bp.route('/equality-data', methods=['GET'])
def get_equality_data():
    """
    فراخوانی استور پروسیجر جدید (مثلاً spGetEqualityData) که در یک JOIN
    اطلاعات کاربر + نقش + موجودی را برمی‌گرداند.
    سپس داده خام را به ساختار مرتب تبدیل کرده و برمی‌گرداند.
    """
    try:
        # 1) فراخوانی استور پروسیجر
        result = db.session.execute(text("EXEC spGetEqualityData"))
        rows = result.fetchall()

        # 2) تبدیل rows به list of dict
        raw_data = []
        for row in rows:
            # row.keys() مثلاً شامل [UserID, FirstName, LastName, Email, RoleID, RoleName, CurrencyType, ...]
            row_dict = dict(row._mapping)
            raw_data.append(row_dict)

        # 3) گروه‌بندی داده‌ها
        transformed = transform_equality_data(raw_data)

        # 4) ارسال خروجی به فرانت
        return jsonify({"success": True, "data": transformed}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
