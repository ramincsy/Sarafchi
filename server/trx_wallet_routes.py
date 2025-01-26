from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
# وارد کردن db و مدل TRXWallet از برنامه اصلی
from user_models import db, TRXWallet
from sqlalchemy import text
# ایجاد Blueprint برای مدیریت آدرس‌های کیف پول TRX
trx_wallet_bp = Blueprint('trx_wallet', __name__)

# Endpoint برای دریافت آدرس کیف پول TRX


@trx_wallet_bp.route('/get-trx-wallet', methods=['GET'])
def get_trx_wallet():
    try:
        # جستجوی اولین آدرس استفاده‌نشده در دیتابیس
        wallet = TRXWallet.query.filter_by(used=False).first()

        if wallet:
            wallet.used = True  # علامت‌گذاری آدرس به عنوان استفاده‌شده
            db.session.commit()
            return jsonify({"walletAddress": wallet.address}), 200
        else:
            return jsonify({"error": "No more TRX wallet addresses available"}), 400
    except Exception as e:
        db.session.rollback()  # در صورت خطا، تغییرات را بازگردانی کنید
        return jsonify({"error": str(e)}), 500

# Endpoint برای افزودن آدرس‌های جدید به جدول TRXWallet


@trx_wallet_bp.route('/add-trx-wallet', methods=['POST'])
def add_trx_wallet():
    try:
        data = request.get_json()
        address = data.get("address")

        if not address:
            return jsonify({"error": "Address is required"}), 400

        # بررسی تکراری نبودن آدرس
        existing_wallet = TRXWallet.query.filter_by(address=address).first()
        if existing_wallet:
            return jsonify({"error": "Address already exists"}), 400

        # ایجاد رکورد جدید در جدول TRXWallet
        new_wallet = TRXWallet(address=address, used=False)
        db.session.add(new_wallet)
        db.session.commit()

        return jsonify({"message": "Wallet address added successfully"}), 201
    except Exception as e:
        db.session.rollback()  # در صورت خطا، تغییرات را بازگردانی کنید
        return jsonify({"error": str(e)}), 500

# Endpoint برای دریافت لیست تمام آدرس‌های کیف پول


@trx_wallet_bp.route('/list-trx-wallets', methods=['GET'])
def list_trx_wallets():
    try:
        wallets = TRXWallet.query.all()
        wallet_list = [{"id": wallet.id, "address": wallet.address,
                        "used": wallet.used} for wallet in wallets]
        return jsonify(wallet_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@trx_wallet_bp.route('/users-wallets', methods=['GET'])
def get_users_wallets():
    try:
        # کوئری برای دریافت اطلاعات کاربران و کیف پول‌ها
        results = db.session.execute(
            text("""
                SELECT 
                    u.ID AS UserID,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    w.WalletAddress,
                    w.Balance
                FROM Users u
                LEFT JOIN Wallets_USDT w ON u.ID = w.UserID
            """)
        ).fetchall()

        users_wallets = [dict(row._mapping) for row in results]

        # محاسبه جمع موجودی کیف پول‌ها
        total_balance = sum(user['Balance'] or 0 for user in users_wallets)

        return jsonify({
            "users_wallets": users_wallets,
            "total_balance": total_balance
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
