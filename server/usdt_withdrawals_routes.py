from flask import Blueprint, request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
from user_models import db
import traceback

# تعریف Blueprint
usdt_withdrawals_bp = Blueprint("usdt_withdrawals", __name__, url_prefix="/api/withdrawals_usdt")

# مسیر برای ثبت درخواست برداشت
@usdt_withdrawals_bp.route("/", methods=["POST"])
def create_usdt_withdrawal():
    try:
        data = request.json
        if not data.get("UserID") or not data.get("Amount") or not data.get("DestinationAddress"):
            return jsonify({
                "success": False,
                "error": "فیلدهای UserID، Amount و DestinationAddress الزامی هستند.",
                "input_data": data
            }), 400

        sql = text("""
            EXEC ManageUSDTWithdrawals
            @Operation='Insert',
            @UserID=:UserID,
            @Amount=:Amount,
            @DestinationAddress=:DestinationAddress
        """)
        db.session.execute(sql, {
            "UserID": data["UserID"],
            "Amount": data["Amount"],
            "DestinationAddress": data["DestinationAddress"]
        })
        db.session.commit()

        return jsonify({"success": True, "message": "درخواست برداشت با موفقیت ثبت شد"}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        error_details = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print("Error during withdrawal creation:", error_details)
        return jsonify({"success": False, "error_details": error_details}), 500


# مسیر برای تایید تراکنش
@usdt_withdrawals_bp.route("/approve", methods=["POST"])
def approve_usdt_withdrawal():
    try:
        data = request.json
        if not data.get("WithdrawalID") or not data.get("StatusChangedBy") or not data.get("TransactionTxID"):
            return jsonify({
                "success": False,
                "error": "فیلدهای WithdrawalID، StatusChangedBy و TransactionTxID الزامی هستند.",
                "input_data": data
            }), 400

        sql = text("""
            EXEC ManageUSDTWithdrawals
            @Operation='Approve',
            @WithdrawalID=:WithdrawalID,
            @StatusChangedBy=:StatusChangedBy,
            @TransactionTxID=:TransactionTxID
        """)
        db.session.execute(sql, {
            "WithdrawalID": data["WithdrawalID"],
            "StatusChangedBy": data["StatusChangedBy"],
            "TransactionTxID": data["TransactionTxID"]
        })
        db.session.commit()

        return jsonify({"success": True, "message": "تراکنش با موفقیت تایید شد"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        error_details = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print("Error during transaction approval:", error_details)
        return jsonify({"success": False, "error_details": error_details}), 500


# مسیر برای لغو تراکنش
@usdt_withdrawals_bp.route("/reject", methods=["POST"])
def reject_usdt_withdrawal():
    try:
        data = request.json
        if not data.get("WithdrawalID") or not data.get("StatusChangedBy"):
            return jsonify({
                "success": False,
                "error": "فیلدهای WithdrawalID و StatusChangedBy الزامی هستند.",
                "input_data": data
            }), 400

        sql = text("""
            EXEC ManageUSDTWithdrawals
            @Operation='Reject',
            @WithdrawalID=:WithdrawalID,
            @StatusChangedBy=:StatusChangedBy
        """)
        db.session.execute(sql, {
            "WithdrawalID": data["WithdrawalID"],
            "StatusChangedBy": data["StatusChangedBy"]
        })
        db.session.commit()

        return jsonify({"success": True, "message": "تراکنش با موفقیت لغو شد"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        error_details = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print("Error during transaction rejection:", error_details)
        return jsonify({"success": False, "error_details": error_details}), 500


# مسیر برای دریافت تمام برداشت‌ها
@usdt_withdrawals_bp.route("/all", methods=["GET"])
def get_all_withdrawals():
    try:
        sql = text("EXEC ManageUSDTWithdrawals @Operation='GetAll'")
        result = db.session.execute(sql)

        # تبدیل نتیجه به دیکشنری
        withdrawals = [
            {
                "WithdrawalID": row.WithdrawalID,
                "UserID": row.UserID,
                "Amount": row.Amount,
                "DestinationAddress": row.DestinationAddress,
                "Status": row.Status,
                "TransactionTxID": row.TransactionTxID,
                "StatusChangedBy": row.StatusChangedBy,
                "CreatedAt": row.CreatedAt.isoformat(),
                "UpdatedAt": row.UpdatedAt.isoformat() if row.UpdatedAt else None,
            }
            for row in result
        ]

        return jsonify({"success": True, "data": withdrawals}), 200

    except SQLAlchemyError as e:
        error_details = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print("Error during fetching all withdrawals:", error_details)
        return jsonify({"success": False, "error_details": error_details}), 500

# مسیر برای دریافت برداشت‌های کاربر خاص
@usdt_withdrawals_bp.route("/user/<int:user_id>", methods=["GET"])
def get_user_withdrawals(user_id):
    try:
        sql = text("""
            EXEC ManageUSDTWithdrawals
            @Operation='GetByUser',
            @UserID=:UserID
        """)
        result = db.session.execute(sql, {"UserID": user_id})

        # تبدیل نتیجه به دیکشنری
        withdrawals = [
            {
                "WithdrawalID": row.WithdrawalID,
                "UserID": row.UserID,
                "Amount": row.Amount,
                "DestinationAddress": row.DestinationAddress,
                "Status": row.Status,
                "TransactionTxID": row.TransactionTxID,
                "StatusChangedBy": row.StatusChangedBy,
                "CreatedAt": row.CreatedAt.isoformat(),
                "UpdatedAt": row.UpdatedAt.isoformat() if row.UpdatedAt else None,
            }
            for row in result
        ]

        return jsonify({"success": True, "data": withdrawals}), 200

    except SQLAlchemyError as e:
        error_details = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print("Error during fetching user withdrawals:", error_details)
        return jsonify({"success": False, "error_details": error_details}), 500

@usdt_withdrawals_bp.route("", methods=["OPTIONS"])
@usdt_withdrawals_bp.route("/", methods=["OPTIONS"])
def handle_options():
    return jsonify({"message": "CORS preflight passed"}), 200
