from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy import text
from user_models import db
import logging
from werkzeug.utils import secure_filename
import os
from Iran_DateTime import get_iran_time
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

equilibrium_bp = Blueprint('equilibrium_bp', __name__)

# ===============================
# مدل‌های SQLAlchemy مربوط به جداول Equilibrium
# ===============================

class EquilibriumProposal(db.Model):
    __tablename__ = 'Equilibrium_Proposals'
    ProposalID = db.Column(db.Integer, primary_key=True)
    CreatedAt = db.Column(db.DateTime, default=get_iran_time, nullable=False)
    CreatedBy = db.Column(db.Integer, nullable=False)  # شناسه کاربری یا معامله‌گری که پیشنهاد را ایجاد کرده
    ProposalType = db.Column(db.String(20), nullable=False)  # مانند "sell_usdt", "buy_usdt", "sell_toman", "buy_toman"
    Currency = db.Column(db.String(20), nullable=False)  # مثال: USDT، Toman و ...
    Amount = db.Column(db.Numeric(20, 4), nullable=False)
    Price = db.Column(db.Numeric(20, 4), nullable=False)
    TotalValue = db.Column(db.Numeric(20, 4), nullable=False)
    Status = db.Column(db.String(20), nullable=False)  # Pending, Confirmed, Completed, Canceled, Expired
    ConfirmedBy = db.Column(db.Integer, nullable=True)
    ConfirmedAt = db.Column(db.DateTime, nullable=True)
    CompletedAt = db.Column(db.DateTime, nullable=True)
    PartnerID = db.Column(db.Integer, nullable=True)  # در صورت معامله با همکار
    Description = db.Column(db.Text, nullable=True)
    ReservedAmount = db.Column(db.Numeric(20, 4), nullable=False, default=0)
    

class EquilibriumTransaction(db.Model):
    __tablename__ = 'Equilibrium_Transactions'
    TransactionID = db.Column(db.Integer, primary_key=True)
    ProposalID = db.Column(db.Integer, db.ForeignKey('Equilibrium_Proposals.ProposalID'), nullable=False)
    InitiatedAt = db.Column(db.DateTime, default=get_iran_time, nullable=False)
    TraderID = db.Column(db.Integer, nullable=False)
    PartnerID = db.Column(db.Integer, nullable=True)
    Currency = db.Column(db.String(20), nullable=False)
    Amount = db.Column(db.Numeric(20, 4), nullable=False)
    Price = db.Column(db.Numeric(20, 4), nullable=False)
    TotalValue = db.Column(db.Numeric(20, 4), nullable=False)
    Status = db.Column(db.String(20), nullable=False)  # Initiated, PendingSettlement, Completed
    Details = db.Column(db.Text, nullable=True)
    
    proposal = db.relationship('EquilibriumProposal', backref='transactions')

class EquilibriumReceipt(db.Model):
    __tablename__ = 'Equilibrium_Receipts'
    ReceiptID = db.Column(db.Integer, primary_key=True)
    TransactionID = db.Column(db.Integer, db.ForeignKey('Equilibrium_Transactions.TransactionID'), nullable=False)
    FilePath = db.Column(db.String(255), nullable=False)
    FileType = db.Column(db.String(10), nullable=False)  # image, pdf, text
    Description = db.Column(db.Text, nullable=True)
    UploadedAt = db.Column(db.DateTime, default=get_iran_time, nullable=False)
    
    transaction = db.relationship('EquilibriumTransaction', backref='receipts')

class EquilibriumCounterparty(db.Model):
    __tablename__ = 'Equilibrium_Counterparties'
    CounterpartyID = db.Column(db.Integer, primary_key=True)
    FirstName = db.Column(db.String(100), nullable=False)
    LastName = db.Column(db.String(100), nullable=False)
    NationalID = db.Column(db.String(20), nullable=True)
    AccountNumber = db.Column(db.String(50), nullable=True)
    IBAN = db.Column(db.String(34), nullable=True)
    CardNumber = db.Column(db.String(50), nullable=True)
    MobileNumber = db.Column(db.String(20), nullable=False)
    ReferralDescription = db.Column(db.Text, nullable=True)
    RegisteredBy = db.Column(db.Integer, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=get_iran_time, nullable=False)

# -------------------------------------
# مدل جدید برای ذخیره وضعیت Wizard
# -------------------------------------
class EquilibriumWizardState(db.Model):
    __tablename__ = 'Equilibrium_WizardState'
    WizardID = db.Column(db.Integer, primary_key=True)
    ProposalID = db.Column(db.Integer, nullable=False)
    TraderID = db.Column(db.Integer, nullable=False)
    Step = db.Column(db.Integer, nullable=False, default=0)
    WizardData = db.Column(db.Text, nullable=True)  # داده‌های JSON به صورت رشته
    CreatedAt = db.Column(db.DateTime, default=get_iran_time, nullable=False)
    UpdatedAt = db.Column(db.DateTime, default=get_iran_time, onupdate=get_iran_time, nullable=False)

# -------------------------------
# توابع کمکی جهت پردازش موجودی‌ها از GetUsersWithDetails
# -------------------------------
COMPANY_ROLES = {"همکار", "معامله گر", "بانک", "خزانه"}
USER_ROLES = {"مشتري", "سود"}
NEUTRAL_ROLES = {"استخر", "Developer"}

def process_balances(result, roles_to_include):
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
        users_dict[user_id]["roles"].add(row.RoleName)
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
    processed_data = []
    for user in users_dict.values():
        if user["balances"]:
            user["roles"] = list(user["roles"])
            processed_data.append(user)
    return processed_data

def convert_decimals(obj):
    if isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, Decimal):
        return float(obj)
    else:
        return obj

def aggregate_totals(data):
    totals = {}
    for user in data:
        for currency, details in user["balances"].items():
            if currency not in totals:
                totals[currency] = {
                    "balance": Decimal(0),
                    "withdrawable_balance": Decimal(0),
                    "locked_balance": Decimal(0),
                    "debt": Decimal(0),
                    "credit": Decimal(0),
                    "loan_amount": Decimal(0)
                }
            for key, value in details.items():
                totals[currency][key] += value
    return totals

# -------------------------------
# Endpointهای اصلی جهت دریافت موجودی و تولید پیشنهاد
# -------------------------------
@equilibrium_bp.route('/user_balances', methods=['GET'])
def get_user_balances():
    result = db.session.execute(text("EXEC GetUsersWithDetails")).fetchall()
    user_data = process_balances(result, USER_ROLES)
    user_totals = aggregate_totals(user_data)
    user_totals = convert_decimals(user_totals)
    return jsonify(user_totals)

@equilibrium_bp.route('/company_balance', methods=['GET'])
def get_company_balance():
    result = db.session.execute(text("EXEC GetUsersWithDetails")).fetchall()
    company_data = process_balances(result, COMPANY_ROLES)
    company_totals = aggregate_totals(company_data)
    company_totals = convert_decimals(company_totals)
    return jsonify(company_totals)

@equilibrium_bp.route('/partner_balances', methods=['GET'])
def get_partner_balances():
    # اجرای استور پروسیجر و دریافت نتایج
    result = db.session.execute(text("EXEC GetUsersWithDetails")).fetchall()
    
    # فیلتر کردن نتایج برای کاربران با نقش "همکار"
    partner_data = []
    for row in result:
        if row.RoleName == 'همکار':
            partner_info = {
                'UserID': row.UserID,
                'CurrencyType':row.CurrencyType,
                'FirstName': row.FirstName,
                'LastName': row.LastName,
                'RoleName': row.RoleName,
                'Balance': row.Balance,
                'WithdrawableBalance': row.WithdrawableBalance,
                'Debt': row.Debt,
                'Credit': row.Credit,
                'LoanAmount': row.LoanAmount,
                'LockedBalance': row.LockedBalance
            }
            partner_data.append(partner_info)
    
    # تبدیل مقادیر دسیمال به float (در صورت نیاز)
    partner_data = convert_decimals(partner_data)
    
    # برگرداندن نتایج به صورت JSON
    return jsonify(partner_data)

@equilibrium_bp.route('/suggestions', methods=['GET'])
def get_suggestions():
    result = db.session.execute(text("EXEC GetUsersWithDetails")).fetchall()
    user_data = process_balances(result, USER_ROLES)
    company_data = process_balances(result, COMPANY_ROLES)
    user_totals = {}
    for user in user_data:
        for currency, details in user["balances"].items():
            user_totals[currency] = user_totals.get(currency, Decimal(0)) + details["balance"]
    company_totals = {}
    for user in company_data:
        for currency, details in user["balances"].items():
            company_totals[currency] = company_totals.get(currency, Decimal(0)) + details["balance"]
    suggestions = []
    for currency in ['USDT', 'Toman']:
        user_total = user_totals.get(currency, Decimal('0'))
        company_total = company_totals.get(currency, Decimal('0'))
        if company_total > user_total:
            diff = company_total - user_total
            action = f"sell_{currency.lower()}"
        elif company_total < user_total:
            diff = user_total - company_total
            action = f"buy_{currency.lower()}"
        else:
            continue

        # جستجوی پیشنهاد فعال موجود برای این ارز
        existing = EquilibriumProposal.query.filter(
            EquilibriumProposal.Currency == currency,
            EquilibriumProposal.Status.in_(["Pending", "Confirmed"])
        ).first()
        proposal_id = existing.ProposalID if existing else None

        suggestion = {
            "action": action,
            "amount": float(diff),
            "message": "",
            "ProposalID": proposal_id
        }
        if currency == 'USDT':
            if action.startswith("sell"):
                suggestion["message"] = "موجودی USDT شرکت بیش از موجودی کاربران است؛ پیشنهاد فروش USDT برای افزایش موجودی Toman."
            else:
                suggestion["message"] = "موجودی USDT شرکت کمتر از موجودی کاربران است؛ پیشنهاد خرید USDT با استفاده از Toman."
        elif currency == 'Toman':
            if action.startswith("sell"):
                suggestion["message"] = "موجودی Toman شرکت بیش از موجودی کاربران است؛ پیشنهاد فروش Toman به ازای افزایش USDT."
            else:
                suggestion["message"] = "موجودی Toman شرکت کمتر از موجودی کاربران است؛ پیشنهاد خرید Toman با استفاده از USDT."
        suggestions.append(suggestion)
    return jsonify(suggestions)

@equilibrium_bp.route('/auto_rebalance', methods=['POST'])
def auto_rebalance():
    try:
        # 1) منقضی کردن پیشنهادهای قدیمی
        now = get_iran_time()
        pending_proposals = EquilibriumProposal.query.filter_by(Status="Pending").all()
        expired_count = 0
        for proposal in pending_proposals:
            expiration_time = proposal.CreatedAt + timedelta(minutes=2)  # یا هر منطق دیگر
            if now > expiration_time:
                proposal.Status = "Expired"
                expired_count += 1

        # تغییرات را ثبت موقتی می‌کنیم تا اگر در ادامه مشکلی رخ داد، بتوانیم رول‌بک کنیم
        db.session.flush()

        # 2) ایجاد پیشنهادهای جدید در صورت عدم تعادل
        result = db.session.execute(text("EXEC GetUsersWithDetails")).fetchall()
        user_data = process_balances(result, USER_ROLES)
        company_data = process_balances(result, COMPANY_ROLES)

        user_totals = {}
        for user in user_data:
            for currency, details in user["balances"].items():
                user_totals[currency] = user_totals.get(currency, Decimal(0)) + details["balance"]

        company_totals = {}
        for user in company_data:
            for currency, details in user["balances"].items():
                company_totals[currency] = company_totals.get(currency, Decimal(0)) + details["balance"]

        thresholds = {"USDT": Decimal('1'), "Toman": Decimal('10000')}
        created_proposals = []

        for currency, threshold in thresholds.items():
            user_total = user_totals.get(currency, Decimal(0))
            company_total = company_totals.get(currency, Decimal(0))
            diff = None
            action = None

            if company_total > user_total:
                diff = company_total - user_total
                action = f"sell_{currency.lower()}"
            elif company_total < user_total:
                diff = user_total - company_total
                action = f"buy_{currency.lower()}"

            if diff and diff >= threshold:
                # بررسی وجود پیشنهادات مشابه درحال انتظار یا تأییدشده
                existing = EquilibriumProposal.query.filter(
                    EquilibriumProposal.Currency == currency,
                    EquilibriumProposal.Status.in_(["Confirmed"])
                ).first()
                if not existing:
                    new_proposal = EquilibriumProposal(
                        CreatedBy=0,
                        ProposalType=action,
                        Currency=currency,
                        Amount=diff,
                        Price=Decimal('0'),
                        TotalValue=Decimal('0'),
                        Status="Pending",
                        Description=f"Auto-generated proposal (auto_rebalance) due to imbalance: diff={diff}",
                        ReservedAmount=diff,
                    )
                    db.session.add(new_proposal)
                    created_proposals.append(new_proposal)

        # 3) نهایی‌سازی تغییرات در دیتابیس
        db.session.commit()

        # آماده‌سازی پاسخ
        output = [{
            'ProposalID': p.ProposalID,
            'Currency': p.Currency,
            'ProposalType': p.ProposalType,
            'Amount': float(p.Amount),
            'Status': p.Status,
            'ReservedAmount': float(p.ReservedAmount),
            'Description': p.Description,
            'CreatedAt': p.CreatedAt.isoformat(),
        } for p in created_proposals]

        return jsonify({
            'message': 'Auto rebalance completed',
            'expired_count': expired_count,
            'created_proposals': output
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500



@equilibrium_bp.route('/auto_create_proposals', methods=['POST'])
def auto_create_proposals():
    try:
        logger.info("Starting auto_create_proposals process...")

        # دریافت داده‌های کاربران از دیتابیس
        logger.info("Fetching user details from the database...")
        result = db.session.execute(text("EXEC GetUsersWithDetails")).fetchall()
        logger.info(f"Fetched {len(result)} records from the database.")

        # پردازش داده‌های کاربران و شرکت‌ها
        logger.info("Processing user and company balances...")
        user_data = process_balances(result, USER_ROLES)
        company_data = process_balances(result, COMPANY_ROLES)
        logger.info("User and company balances processed successfully.")

        # محاسبه مجموع موجودی‌های کاربران
        user_totals = {}
        for user in user_data:
            for currency, details in user["balances"].items():
                user_totals[currency] = user_totals.get(currency, Decimal(0)) + details["balance"]
        logger.info(f"User totals calculated: {user_totals}")

        # محاسبه مجموع موجودی‌های شرکت‌ها
        company_totals = {}
        for user in company_data:
            for currency, details in user["balances"].items():
                company_totals[currency] = company_totals.get(currency, Decimal(0)) + details["balance"]
        logger.info(f"Company totals calculated: {company_totals}")

        # تعیین آستانه‌ها برای ایجاد پیشنهادات
        thresholds = {"USDT": Decimal('1'), "Toman": Decimal('10000')}
        created_proposals = []

        # بررسی تفاوت موجودی‌ها و ایجاد پیشنهادات
        for currency, threshold in thresholds.items():
            user_total = user_totals.get(currency, Decimal('0'))
            company_total = company_totals.get(currency, Decimal('0'))
            diff = None
            action = None

            if company_total > user_total:
                diff = company_total - user_total
                action = f"sell_{currency.lower()}"
                logger.info(f"Company has more {currency} than users. Difference: {diff}. Action: {action}")
            elif company_total < user_total:
                diff = user_total - company_total
                action = f"buy_{currency.lower()}"
                logger.info(f"Users have more {currency} than company. Difference: {diff}. Action: {action}")
            else:
                logger.info(f"No difference in {currency} balances between users and company.")

            if diff is None or diff < threshold:
                logger.info(f"Difference for {currency} is below the threshold ({threshold}). Skipping proposal creation.")
                continue

            # بررسی وجود پیشنهادات مشابه در حال انتظار یا تأیید شده
            existing = EquilibriumProposal.query.filter(
                EquilibriumProposal.Currency == currency,
                EquilibriumProposal.Status.in_(["Pending", "Confirmed"])
            ).first()
            if existing:
                logger.info(f"An existing proposal for {currency} is already in progress. Skipping creation.")
                continue

            # ایجاد پیشنهاد جدید
            new_proposal = EquilibriumProposal(
                CreatedBy=0,
                ProposalType=action,
                Currency=currency,
                Amount=diff,
                Price=Decimal('0'),
                TotalValue=Decimal('0'),
                Status="Pending",
                Description=f"Auto-generated proposal due to imbalance: diff={diff}",
                ReservedAmount=diff,
                # ExpirationTime حذف شده است
            )
            db.session.add(new_proposal)
            created_proposals.append(new_proposal)
            logger.info(f"New proposal created: {new_proposal.ProposalType} for {currency} with amount {diff}.")

        # ذخیره تغییرات در دیتابیس
        logger.info("Committing changes to the database...")
        db.session.commit()
        logger.info("Changes committed successfully.")

        # آماده‌سازی خروجی
        output = [{
            'ProposalID': p.ProposalID,
            'Currency': p.Currency,
            'ProposalType': p.ProposalType,
            'Amount': float(p.Amount),
            'Status': p.Status,
            'ReservedAmount': float(p.ReservedAmount),
            'Description': p.Description,
            'CreatedAt': p.CreatedAt.isoformat(),
            # ExpirationTime حذف شده است
        } for p in created_proposals]

        logger.info(f"Auto creation completed. Created {len(created_proposals)} proposals.")
        return jsonify({'message': 'Auto creation completed', 'proposals': output}), 200

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@equilibrium_bp.route('/expire_proposals', methods=['POST'])
def expire_proposals():
    try:
        now = get_iran_time()  # زمان فعلی
        pending_proposals = EquilibriumProposal.query.filter_by(Status="Pending").all()  # پیشنهادات در حال انتظار
        expired_count = 0  # شمارنده پیشنهادات منقضی شده

        for proposal in pending_proposals:
            # محاسبه زمان انقضا (۲ دقیقه بعد از تاریخ ایجاد)
            expiration_time = proposal.CreatedAt + timedelta(minutes=2)

            # بررسی انقضا
            if now > expiration_time:
                proposal.Status = "Expired"  # به‌روزرسانی وضعیت به "منقضی شده"
                expired_count += 1  # افزایش شمارنده

        db.session.commit()  # ذخیره تغییرات در دیتابیس
        return jsonify({
            "message": "Expired proposals updated.",
            "expired_count": expired_count  # تعداد پیشنهادات منقضی شده
        }), 200

    except Exception as e:
        db.session.rollback()  # بازگردانی تغییرات در صورت خطا
        return jsonify({"error": str(e)}), 500  # بازگرداندن خطا

@equilibrium_bp.route('/proposals/<int:proposal_id>/approve', methods=['PUT'])
def approve_proposal(proposal_id):
    data = request.get_json()
    try:
        proposal = EquilibriumProposal.query.get(proposal_id)
        if not proposal:
            return jsonify({'error': 'Proposal not found'}), 404

        if proposal.Status != 'Pending':
            return jsonify({'error': 'Proposal is not in Pending state'}), 400

        proposal.Status = 'Confirmed'
        proposal.ConfirmedBy = data['ConfirmedBy']  # شناسه کاربری که تایید را انجام داده
        proposal.ConfirmedAt = get_iran_time()
        proposal.ReservedAmount = proposal.Amount  # فرض بر اینکه موجودی رزرو شود

        db.session.commit()
        return jsonify({
            'message': 'Proposal approved',
            'proposal_id': proposal.ProposalID
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@equilibrium_bp.route('/proposals/<int:proposal_id>/complete', methods=['PUT'])
def complete_proposal(proposal_id):
    try:
        proposal = EquilibriumProposal.query.get(proposal_id)
        if not proposal:
            return jsonify({'error': 'Proposal not found'}), 404
        if proposal.Status != 'Confirmed':
            return jsonify({'error': 'Proposal is not in Confirmed state'}), 400
        proposal.Status = 'Completed'
        proposal.CompletedAt = get_iran_time()
        proposal.ReservedAmount = Decimal('0')
        db.session.commit()
        return jsonify({'message': 'Proposal completed', 'proposal_id': proposal.ProposalID}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@equilibrium_bp.route('/transactions', methods=['POST'])
def create_transaction():
    data = request.get_json()
    try:
        proposal_id = data['ProposalID']
        proposal = EquilibriumProposal.query.get(proposal_id)
        if not proposal:
            return jsonify({'error': 'Proposal not found'}), 404
        if proposal.Status != 'Confirmed':
            return jsonify({'error': 'Proposal is not confirmed'}), 400
        amount = Decimal(data.get('Amount', proposal.Amount))
        price = Decimal(data.get('Price', proposal.Price))
        transaction = EquilibriumTransaction(
            ProposalID=proposal_id,
            TraderID=data['TraderID'],
            PartnerID=data.get('PartnerID'),
            Currency=proposal.Currency,
            Amount=amount,
            Price=price,
            TotalValue=amount * price,
            Status='Initiated',
            Details=data.get('Details', '')
        )
        db.session.add(transaction)
        db.session.commit()
        return jsonify({'message': 'Transaction created', 'transaction_id': transaction.TransactionID}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@equilibrium_bp.route('/receipts', methods=['POST'])
def upload_receipt():
    try:
        print("Headers received:", request.headers)  # Log request headers
        print("Files received:", request.files)  # Log received files
        print("Form data received:", request.form)  # Log received form data

        file = request.files.get('file')
        if not file:
            print("No file part in the request.")
            return jsonify({'error': 'No file part'}), 400

        data = request.form.to_dict()
        transaction_id = data.get('TransactionID')
        file_type = data.get('FileType')
        description = data.get('Description', '')

        print(f"Received data - TransactionID: {transaction_id}, FileType: {file_type}, Description: {description}")

        if not transaction_id or not file_type:
            print("Missing required fields.")
            return jsonify({'error': 'Missing required fields'}), 400

        filename = secure_filename(file.filename)
        file_path = os.path.join('C:\\inetpub\\wwwroot\\sarafchi\\uploads', filename)
        file.save(file_path)

        receipt = EquilibriumReceipt(
            TransactionID=transaction_id,
            FilePath=file_path,
            FileType=file_type,
            Description=description
        )
        db.session.add(receipt)
        db.session.commit()

        return jsonify({'message': 'Receipt uploaded', 'receipt_id': receipt.ReceiptID}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500

@equilibrium_bp.route('/counterparties', methods=['POST'])
def create_counterparty():
    data = request.get_json()
    try:
        counterparty = EquilibriumCounterparty(
            FirstName=data['FirstName'],
            LastName=data['LastName'],
            NationalID=data.get('NationalID'),
            AccountNumber=data.get('AccountNumber'),
            IBAN=data.get('IBAN'),
            CardNumber=data.get('CardNumber'),
            MobileNumber=data['MobileNumber'],
            ReferralDescription=data.get('ReferralDescription'),
            RegisteredBy=data['RegisteredBy']
        )
        db.session.add(counterparty)
        db.session.commit()
        return jsonify({'message': 'Counterparty created', 'counterparty_id': counterparty.CounterpartyID}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@equilibrium_bp.route('/proposals', methods=['GET'])
def list_proposals():
    proposals = EquilibriumProposal.query.all()
    result = []
    for p in proposals:
        # محاسبه زمان انقضا (۲ دقیقه بعد از تاریخ ایجاد)
        expiration_time = p.CreatedAt + timedelta(minutes=2)

        result.append({
            'ProposalID': p.ProposalID,
            'CreatedAt': p.CreatedAt.isoformat(),
            'CreatedBy': p.CreatedBy,
            'ProposalType': p.ProposalType,
            'Currency': p.Currency,
            'Amount': float(p.Amount),
            'Price': float(p.Price),
            'TotalValue': float(p.TotalValue),
            'Status': p.Status,
            'ConfirmedBy': p.ConfirmedBy,
            'ConfirmedAt': p.ConfirmedAt.isoformat() if p.ConfirmedAt else None,
            'CompletedAt': p.CompletedAt.isoformat() if p.CompletedAt else None,
            'PartnerID': p.PartnerID,
            'Description': p.Description,
            'ReservedAmount': float(p.ReservedAmount),
            'ExpirationTime': expiration_time.isoformat()  # زمان انقضا محاسبه شده
        })
    return jsonify(result)

@equilibrium_bp.route('/transactions', methods=['GET'])
def list_transactions():
    transactions = EquilibriumTransaction.query.all()
    result = []
    for t in transactions:
        result.append({
            'TransactionID': t.TransactionID,
            'ProposalID': t.ProposalID,
            'InitiatedAt': t.InitiatedAt.isoformat(),
            'TraderID': t.TraderID,
            'PartnerID': t.PartnerID,
            'Currency': t.Currency,
            'Amount': float(t.Amount),
            'Price': float(t.Price),
            'TotalValue': float(t.TotalValue),
            'Status': t.Status,
            'Details': t.Details
        })
    return jsonify(result)

@equilibrium_bp.route('/receipts', methods=['GET'])
def list_receipts():
    transaction_id = request.args.get('transaction_id')
    if not transaction_id:
        return jsonify({'error': 'transaction_id is required'}), 400
    receipts = EquilibriumReceipt.query.filter_by(TransactionID=transaction_id).all()
    result = []
    for r in receipts:
        result.append({
            'ReceiptID': r.ReceiptID,
            'TransactionID': r.TransactionID,
            'FilePath': r.FilePath,
            'FileType': r.FileType,
            'Description': r.Description,
            'UploadedAt': r.UploadedAt.isoformat()
        })
    return jsonify(result)

@equilibrium_bp.route('/counterparties', methods=['GET'])
def list_counterparties():
    counterparties = EquilibriumCounterparty.query.all()
    result = []
    for c in counterparties:
        result.append({
            'CounterpartyID': c.CounterpartyID,
            'FirstName': c.FirstName,
            'LastName': c.LastName,
            'NationalID': c.NationalID,
            'AccountNumber': c.AccountNumber,
            'IBAN': c.IBAN,
            'CardNumber': c.CardNumber,
            'MobileNumber': c.MobileNumber,
            'ReferralDescription': c.ReferralDescription,
            'RegisteredBy': c.RegisteredBy,
            'CreatedAt': c.CreatedAt.isoformat()
        })
    return jsonify(result)

@equilibrium_bp.route('/recalculate_proposals', methods=['POST'])
def recalculate_proposals():
    try:
        total_company_balance = Decimal('1000')  # مقدار فرضی؛ در واقع باید از سیستم حسابداری خوانده شود
        confirmed_proposals = EquilibriumProposal.query.filter_by(Status='Confirmed').all()
        reserved_total = sum([p.ReservedAmount for p in confirmed_proposals])
        free_balance = total_company_balance - reserved_total
        return jsonify({
            'message': 'Recalculation completed',
            'total_company_balance': float(total_company_balance),
            'reserved_total': float(reserved_total),
            'free_balance': float(free_balance)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ----------------------------------
# Endpointهای ذخیره و بازیابی وضعیت Wizard
# ----------------------------------
@equilibrium_bp.route('/wizard_state', methods=['POST'])
def save_wizard_state():
    data = request.get_json()
    proposal_id = data.get('ProposalID')
    trader_id = data.get('TraderID')
    step = data.get('Step')
    wizard_data = data.get('WizardData')
    
    if not proposal_id or not trader_id or step is None:
        return jsonify({"error": "ProposalID, TraderID and Step are required."}), 400

    wizard_state = EquilibriumWizardState.query.filter_by(
        ProposalID=proposal_id,
        TraderID=trader_id
    ).first()
    if wizard_state:
        wizard_state.Step = step
        wizard_state.WizardData = wizard_data
    else:
        wizard_state = EquilibriumWizardState(
            ProposalID=proposal_id,
            TraderID=trader_id,
            Step=step,
            WizardData=wizard_data
        )
        db.session.add(wizard_state)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "message": "Wizard state saved successfully.",
        "WizardID": wizard_state.WizardID,
        "Step": wizard_state.Step,
        "WizardData": wizard_state.WizardData
    }), 200

@equilibrium_bp.route('/wizard_state/<int:proposal_id>', methods=['GET'])
def get_wizard_state(proposal_id):
    trader_id = request.args.get('TraderID')
    if not trader_id:
        return jsonify({"error": "TraderID query parameter is required."}), 400

    wizard_state = EquilibriumWizardState.query.filter_by(
        ProposalID=proposal_id,
        TraderID=trader_id
    ).first()
    if wizard_state:
        return jsonify({
            "ProposalID": wizard_state.ProposalID,
            "TraderID": wizard_state.TraderID,
            "Step": wizard_state.Step,
            "WizardData": wizard_state.WizardData,
            "UpdatedAt": wizard_state.UpdatedAt.isoformat()
        }), 200
    else:
        return jsonify({"message": "No wizard state found."}), 404
