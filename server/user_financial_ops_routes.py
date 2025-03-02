# user_financial_ops_routes.py
from flask import Blueprint, request, jsonify
from sqlalchemy import text
from user_models import db

user_financial_bp = Blueprint('user_financial_bp', __name__)

@user_financial_bp.route('/financialOps', methods=['GET'])
def get_financial_operations():
    """
    لیست‌کردن عملیات مالی در جدول UserFinancialOperations.
    پارامترهای اختیاری:
      userId=?    برای فیلترکردن بر اساس کاربر
      currency=?  برای فیلترکردن بر اساس ارز
    """
    try:
        user_id = request.args.get('userId', type=int)
        currency = request.args.get('currency', type=str)  # مثلا 'IRR' یا 'USDT' و ...

        base_query = """
            SELECT
                OperationID,
                UserID,
                CurrencyType,            -- حالا ستون CurrencyType هم می‌گیریم
                Balance,
                WithdrawableBalance,
                Debt,
                Credit,
                LoanAmount,
                Amount,
                UpdateSource,
                UpdatedBy,
                OperationType,
                OperationNote,
                Status,
                RevertOf,
                LastUpdated
            FROM dbo.UserFinancialOperations
            WHERE 1=1
        """

        # برای شرط userId
        if user_id:
            base_query += " AND UserID = :user_id"

        # برای شرط currency
        if currency:
            base_query += " AND CurrencyType = :currency"

        base_query += " ORDER BY OperationID DESC"

        params = {}
        if user_id:
            params["user_id"] = user_id
        if currency:
            params["currency"] = currency

        result = db.session.execute(text(base_query), params).fetchall()
        ops = [dict(row._mapping) for row in result]
        return jsonify(ops), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@user_financial_bp.route('/financialOps', methods=['POST'])
def add_financial_operation():
    """
    افزودن عملیات جدید روی کاربر (مثلا شارژ، برداشت، وام و ...) 
    با صدا زدن استور پروسیجر sp_AddUserFinancialOperation

    بدنه‌ی درخواست (JSON):
    {
      "user_id": 123,
      "currency_type": "IRR",   // پیش‌فرض 'IRR' اگر ارسال نشود
      "operation_type": "Charge",
      "amount": 100000,
      "reason": "شارژ دستی",
      "update_source": "Manual",
      "updated_by": 1
    }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        currency_type = data.get('currency_type', 'Toman')  # اگر نیامد، IRR بگذار
        operation_type = data.get('operation_type')
        amount = data.get('amount')
        reason = data.get('reason', '')
        update_source = data.get('update_source', 'Manual')
        updated_by = data.get('updated_by')

        # اعتبارسنجی اولیه
        if None in [user_id, operation_type, amount, updated_by]:
            return jsonify({'error': 'Missing required fields (user_id, operation_type, amount, updated_by).'}), 400

        sp_sql = text("""
            EXEC sp_AddUserFinancialOperation
                :UserID,
                :CurrencyType,
                :OperationType,
                :Amount,
                :Reason,
                :UpdateSource,
                :UpdatedBy
        """)

        db.session.execute(sp_sql, {
            "UserID": user_id,
            "CurrencyType": currency_type,
            "OperationType": operation_type,
            "Amount": amount,
            "Reason": reason,
            "UpdateSource": update_source,
            "UpdatedBy": updated_by
        })
        db.session.commit()

        return jsonify({"message": "Operation applied successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@user_financial_bp.route('/financialOps/revert/<int:operation_id>', methods=['POST'])
def revert_financial_operation(operation_id):
    """
    بازگردانی یک عملیات قبلی از طریق sp_RevertUserFinancialOperation

    بدنه‌ی درخواست:
    {
      "reverted_by": 2,
      "reason": "اشتباه در شارژ"
    }
    """
    try:
        data = request.get_json()
        reverted_by = data.get('reverted_by')
        reason = data.get('reason', '')

        if not reverted_by:
            return jsonify({'error': 'Missing reverted_by'}), 400

        sp_sql = text("""
            EXEC sp_RevertUserFinancialOperation
                :OperationID,
                :RevertedBy,
                :Reason
        """)

        db.session.execute(sp_sql, {
            "OperationID": operation_id,
            "RevertedBy": reverted_by,
            "Reason": reason
        })
        db.session.commit()

        return jsonify({"message": "Operation reverted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@user_financial_bp.route('/financialOps/lastStatus/<int:user_id>', methods=['GET'])
def get_last_status(user_id):
    """
    دریافت آخرین وضعیت مالی کاربر (آخرین رکورد Applied)
    + برگشت totalLoanGiven, totalLoanRepaid براساس جمع ستون Amount.
    در صورت نبود رکورد Applied، کد 404 برمی‌گرداند.

    اگر نیاز باشد بر اساس ارز هم فیلتر کنیم، می‌توانیم پارامتر ?currency=... بگیریم.
    """
    try:
        currency = request.args.get('currency', type=str)  # مثلا 'IRR'

        # ساخت Query
        query_last = """
            SELECT TOP 1
                OperationID,
                UserID,
                CurrencyType,
                Balance,
                WithdrawableBalance,
                Debt,
                Credit,
                LoanAmount,
                Amount,
                LastUpdated,
                OperationType
            FROM dbo.UserFinancialOperations
            WHERE UserID = :uid
              AND Status='Applied'
        """
        if currency:
            query_last += " AND CurrencyType = :cur"
        query_last += " ORDER BY OperationID DESC"

        params_last = {"uid": user_id}
        if currency:
            params_last["cur"] = currency

        result_last = db.session.execute(text(query_last), params_last).fetchone()

        if not result_last:
            return jsonify({
                "message": "No applied record found for this user",
                "totalLoanGiven": 0,
                "totalLoanRepaid": 0
            }), 404

        last_status = dict(result_last._mapping)

        # 2) محاسبه مجموع وام (Loan) و بازپرداخت (LoanRepayment) از ستون Amount
        query_loan_stats = """
            SELECT
                SUM(CASE WHEN OperationType='Loan' AND Status='Applied'
                         THEN Amount ELSE 0 END) AS TotalLoanGiven,
                SUM(CASE WHEN OperationType='LoanRepayment' AND Status='Applied'
                         THEN Amount ELSE 0 END) AS TotalLoanRepaid
            FROM dbo.UserFinancialOperations
            WHERE UserID = :uid
        """
        if currency:
            query_loan_stats += " AND CurrencyType = :cur"

        params_loan = {"uid": user_id}
        if currency:
            params_loan["cur"] = currency

        loan_result = db.session.execute(text(query_loan_stats), params_loan).fetchone()
        total_loan_given = loan_result.TotalLoanGiven or 0
        total_loan_repaid = loan_result.TotalLoanRepaid or 0

        last_status["totalLoanGiven"] = float(total_loan_given)
        last_status["totalLoanRepaid"] = float(total_loan_repaid)

        return jsonify(last_status), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@user_financial_bp.route('/financialOps/clear', methods=['DELETE'])
def clear_financial_ops():
    """
    پاک کردن همه رکوردهای جدول UserFinancialOperations
    جهت تست مجدد
    """
    try:
        query = text("""
            DELETE FROM dbo.UserFinancialOperations;
            DBCC CHECKIDENT ('dbo.UserFinancialOperations', RESEED, 0);
        """)
        db.session.execute(query)
        db.session.commit()
        return jsonify({"message": "All records cleared and ID reseeded."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
