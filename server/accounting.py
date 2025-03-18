from flask import Blueprint, jsonify
from sqlalchemy import text
from decimal import Decimal
from user_models import db

accounting_bp = Blueprint('accounting_bp', __name__)

# تعریف نقش‌های مورد استفاده برای فیلتر کاربران و شرکت
COMPANY_ROLES = {"همکار", "معامله گر", "بانک", "خزانه"}
USER_ROLES = {"مشتري", "سود"}
NEUTRAL_ROLES = {"استخر", "Developer"}

def process_balances(result, roles_to_include):
    """
    این تابع داده‌های بازگشتی از استور پروسیجر را به ازای هر کاربر بر اساس نقش‌های مورد نظر فیلتر می‌کند.
    اگر یک کاربر چند رکورد برای یک ارز داشته باشد (به دلیل چند نقش)، تنها اولین رکورد در نظر گرفته می‌شود.
    """
    users_dict = {}
    for row in result:
        user_id = row.UserID
        if user_id not in users_dict:
            users_dict[user_id] = {
                "user_id": user_id,
                "name": f"{row.FirstName or ''} {row.LastName or ''}".strip(),
                "roles": set(),
                "balances": {}
            }
        # افزودن تمامی نقش‌ها برای نمایش کامل
        users_dict[user_id]["roles"].add(row.RoleName)
        
        # پردازش تنها در صورتی که نقش در مجموعه roles_to_include باشد
        if row.RoleName not in roles_to_include:
            continue
        
        currency = row.CurrencyType
        if not currency or currency == 'N/A':
            continue
        
        if currency not in users_dict[user_id]["balances"]:
            users_dict[user_id]["balances"][currency] = {
                "balance": Decimal(row.Balance) if row.Balance is not None else Decimal(0),
                "withdrawable_balance": Decimal(row.WithdrawableBalance) if row.WithdrawableBalance is not None else Decimal(0),
                "locked_balance": Decimal(row.LockedBalance) if row.LockedBalance is not None else Decimal(0),
                "debt": Decimal(row.Debt) if row.Debt is not None else Decimal(0),
                "credit": Decimal(row.Credit) if row.Credit is not None else Decimal(0),
                "loan_amount": Decimal(row.LoanAmount) if row.LoanAmount is not None else Decimal(0)
            }
        # در صورت وجود رکورد برای یک ارز، از اضافه‌شماری جلوگیری می‌شود.
    processed_data = []
    for user in users_dict.values():
        if user["balances"]:
            user["roles"] = list(user["roles"])
            processed_data.append(user)
    return processed_data

def convert_decimals(obj):
    """
    تابع کمکی برای تبدیل مقادیر Decimal به float در ساختارهای دیکشنری یا لیست.
    """
    if isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, Decimal):
        return float(obj)
    else:
        return obj

@accounting_bp.route('/user_balances', methods=['GET'])
def get_user_balances():
    # فراخوانی استور پروسیجر جهت دریافت جزئیات کاربران
    result = db.session.execute(text("EXEC GetUsersWithDetails")).fetchall()
    data = process_balances(result, USER_ROLES)
    data = convert_decimals(data)
    return jsonify(data)

@accounting_bp.route('/company_balance', methods=['GET'])
def get_company_balance():
    # فراخوانی استور پروسیجر جهت دریافت جزئیات کاربران
    result = db.session.execute(text("EXEC GetUsersWithDetails")).fetchall()
    data = process_balances(result, COMPANY_ROLES)
    company_balances = {}
    for user in data:
        for currency, balance_details in user["balances"].items():
            if currency not in company_balances:
                company_balances[currency] = {
                    "balance": Decimal(0),
                    "withdrawable_balance": Decimal(0),
                    "locked_balance": Decimal(0),
                    "debt": Decimal(0),
                    "credit": Decimal(0),
                    "loan_amount": Decimal(0)
                }
            for key, value in balance_details.items():
                company_balances[currency][key] += value
    company_balances = convert_decimals(company_balances)
    return jsonify(company_balances)

@accounting_bp.route('/suggestions', methods=['GET'])
def get_suggestions():
    # اجرای یکبار استور پروسیجر جهت دریافت تمامی جزئیات
    result = db.session.execute(text("EXEC GetUsersWithDetails")).fetchall()
    
    # استفاده از همان تابع process_balances برای دو گروه:
    # گروه کاربران (با نقش‌های مشتری)
    user_data = process_balances(result, USER_ROLES)
    # گروه شرکت (با نقش‌های شرکت)
    company_data = process_balances(result, COMPANY_ROLES)
    
    # تجمیع موجودی کل کاربران بر اساس ارز (از داده‌های برگشتی /user_balances)
    user_totals = {}
    for user in user_data:
        for currency, details in user["balances"].items():
            user_totals[currency] = user_totals.get(currency, Decimal(0)) + details["balance"]
    
    # تجمیع موجودی شرکت بر اساس ارز (از داده‌های برگشتی /company_balance)
    company_totals = {}
    for user in company_data:
        for currency, details in user["balances"].items():
            company_totals[currency] = company_totals.get(currency, Decimal(0)) + details["balance"]
    
    suggestions = []
    # بررسی ارزهای مورد نظر (مثلاً USDT و Toman)
    for currency in ['USDT', 'Toman']:
        user_total = user_totals.get(currency, Decimal('0'))
        company_total = company_totals.get(currency, Decimal('0'))
        if company_total > user_total:
            diff = float(company_total - user_total)
            if currency == 'USDT':
                suggestions.append({
                    "action": "sell_usdt",
                    "amount": diff,
                    "message": "موجودی USDT شرکت بیش از موجودی کاربران است؛ پیشنهاد فروش USDT برای افزایش موجودی Toman."
                })
            elif currency == 'Toman':
                suggestions.append({
                    "action": "sell_toman",
                    "amount": diff,
                    "message": "موجودی Toman شرکت بیش از موجودی کاربران است؛ پیشنهاد فروش Toman به ازای افزایش USDT."
                })
        elif company_total < user_total:
            diff = float(user_total - company_total)
            if currency == 'USDT':
                suggestions.append({
                    "action": "buy_usdt",
                    "amount": diff,
                    "message": "موجودی USDT شرکت کمتر از موجودی کاربران است؛ پیشنهاد خرید USDT با استفاده از Toman."
                })
            elif currency == 'Toman':
                suggestions.append({
                    "action": "buy_toman",
                    "amount": diff,
                    "message": "موجودی Toman شرکت کمتر از موجودی کاربران است؛ پیشنهاد خرید Toman با استفاده از USDT."
                })
    
    return jsonify(suggestions)
