# user_financial_ops_routes.py
from flask import Blueprint, request, jsonify
from sqlalchemy import text
from user_models import db  # یا هر جایی که Session / SQLAlchemy instance دارید

user_financial_bp = Blueprint('user_financial_bp', __name__)

@user_financial_bp.route('/financialOps', methods=['GET'])
def get_financial_operations():
    """
    لیست‌کردن عملیات مالی ثبت‌شده در جدول UserFinancialOperations.
    ورودی اختیاری: userId=? برای فیلتر روی یک کاربر خاص
    """
    try:
        user_id = request.args.get('userId', type=int)
        
        base_query = """
            SELECT
                OperationID,
                UserID,
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
        """

        if user_id:
            base_query += " WHERE UserID = :user_id ORDER BY OperationID DESC"
            result = db.session.execute(text(base_query), {"user_id": user_id}).fetchall()
        else:
            base_query += " ORDER BY OperationID DESC"
            result = db.session.execute(text(base_query)).fetchall()

        ops = [dict(row._mapping) for row in result]
        return jsonify(ops), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@user_financial_bp.route('/financialOps', methods=['POST'])
def add_financial_operation():
    """
    افزودن عملیات جدید روی کاربر (مثلا شارژ، برداشت، وام و ...) 
    با صدا زدن استور پروسیجر sp_AddUserFinancialOperation

    بدنه‌ی درخواست:
    {
      "user_id": 123,
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
        operation_type = data.get('operation_type')
        amount = data.get('amount')
        reason = data.get('reason', '')
        update_source = data.get('update_source', 'Manual')
        updated_by = data.get('updated_by')

        if None in [user_id, operation_type, amount, updated_by]:
            return jsonify({'error': 'Missing required fields'}), 400

        sp_sql = text("""
            EXEC sp_AddUserFinancialOperation
                :UserID,
                :OperationType,
                :Amount,
                :Reason,
                :UpdateSource,
                :UpdatedBy
        """)

        db.session.execute(sp_sql, {
            "UserID": user_id,
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
    """
    try:
        # 1) آخرین رکورد Applied
        query_last = text("""
            SELECT TOP 1
                OperationID,
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
            ORDER BY OperationID DESC
        """)
        result_last = db.session.execute(query_last, {"uid": user_id}).fetchone()

        if not result_last:
            # هیچ رکورد Applied وجود ندارد
            # همچنین می‌توانیم کل وام را هم صفر برگردانیم
            response_data = {
                "message": "No applied record found for this user",
                "totalLoanGiven": 0,
                "totalLoanRepaid": 0
            }
            return jsonify(response_data), 404

        last_status = dict(result_last._mapping)

        # 2) محاسبه مجموع وام پرداختی (Loan) و بازپرداخت (LoanRepayment)
        # براساس ستون Amount
        query_loan_stats = text("""
            SELECT
                SUM(CASE WHEN OperationType='Loan' AND Status='Applied' 
                         THEN Amount ELSE 0 END) AS TotalLoanGiven,
                SUM(CASE WHEN OperationType='LoanRepayment' AND Status='Applied'
                         THEN Amount ELSE 0 END) AS TotalLoanRepaid
            FROM dbo.UserFinancialOperations
            WHERE UserID=:uid
        """)
        loan_result = db.session.execute(query_loan_stats, {"uid": user_id}).fetchone()

        total_loan_given = loan_result.TotalLoanGiven or 0
        total_loan_repaid = loan_result.TotalLoanRepaid or 0

        # مقادیر را در پاسخ قرار می‌دهیم
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
