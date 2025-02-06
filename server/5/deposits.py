from flask import Blueprint, jsonify
from sqlalchemy import text
from user_models import db
import requests
import base58
import logging
from threading import Lock
from datetime import datetime

# تنظیمات اولیه
# تغییر به DEBUG برای مشاهده تمامی لاگ‌ها
logging.basicConfig(level=logging.DEBUG)
api_key_lock = Lock()
api_key_index = 0
API_KEYS = [
    "45aecaf1-6bd3-4618-a1f6-d06d4c3ff9ba",
    "b4105517-c59e-4900-904e-9a731fe1625e",
    "a45effb7-3709-4d5e-bdfc-0268a3d7bb30"
]
USDT_CONTRACT_ADDRESS = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"

deposits_bp = Blueprint('deposits', __name__)


def fetch(url, headers, payload):
    logging.debug(f"Fetching data from {url} with payload: {payload}")
    response = requests.post(url, headers=headers, json=payload)
    logging.debug(f"Response: {response.status_code} - {response.text}")
    return response.json()


def get_trc20_transactions(address, limit=20):
    url = f"https://api.trongrid.io/v1/accounts/{address}/transactions/trc20"
    headers = {"accept": "application/json"}
    params = {
        "contract_address": USDT_CONTRACT_ADDRESS,
        "limit": limit,
        "order_by": "block_timestamp,desc"
    }
    logging.debug(f"Requesting transactions for address {
                  address} with params: {params}")
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        logging.debug(f"Transactions fetched successfully for {address}.")
        return response.json()
    else:
        logging.error(f"Error fetching transactions for {
                      address}: {response.status_code}")
        return None


def process_deposits():
    """
    پردازش تراکنش‌های دریافتی برای تمامی کیف پول‌های کاربران و ثبت آنها در دیتابیس.
    """
    logging.info("Fetching all wallets from database.")
    wallets = db.session.execute(
        text("SELECT WalletID, WalletAddress FROM Wallets_USDT")
    ).fetchall()

    logging.debug(f"Wallets fetched: {wallets}")

    for wallet in wallets:
        wallet_id = wallet.WalletID
        address = wallet.WalletAddress
        logging.info(f"Processing wallet: {address} (ID: {wallet_id})")
        transactions = get_trc20_transactions(address)

        if transactions and transactions.get("success", False):
            for tx in transactions.get("data", []):
                transaction_hash = tx['transaction_id']
                value = int(tx['value']) / 10**6  # تبدیل مقدار به واحد USDT
                to_address = tx['to']

                logging.debug(f"Processing transaction {transaction_hash}: to={
                              to_address}, value={value}")

                # بررسی اینکه تراکنش مربوط به کیف پول کاربر است
                if to_address.lower() == address.lower():
                    # بررسی وجود تراکنش در دیتابیس
                    existing_transaction = db.session.execute(
                        text(
                            "SELECT 1 FROM Deposits_USDT WHERE TransactionHash = :tx_hash"),
                        {"tx_hash": transaction_hash}
                    ).fetchone()

                    if not existing_transaction:
                        logging.info(f"Recording new transaction: {
                                     transaction_hash}")

                        # ثبت تراکنش جدید
                        db.session.execute(
                            text("""
                                INSERT INTO Deposits_USDT (WalletID, Amount, TransactionHash, DepositDateTime, Status, CreatedAt)
                                VALUES (:wallet_id, :amount, :tx_hash, :deposit_time, 'Completed', :created_at)
                            """),
                            {
                                "wallet_id": wallet_id,
                                "amount": value,
                                "tx_hash": transaction_hash,
                                "deposit_time": datetime.now(),
                                "created_at": datetime.now()
                            }
                        )

                        # بروزرسانی موجودی کاربر
                        db.session.execute(
                            text("""
                                UPDATE Wallets_USDT
                                SET Balance = Balance + :amount, LastUpdated = :last_updated
                                WHERE WalletID = :wallet_id
                            """),
                            {
                                "amount": value,
                                "wallet_id": wallet_id,
                                "last_updated": datetime.now()
                            }
                        )
                        logging.info(f"Updated balance for wallet {
                                     address} by {value} USDT.")
                    else:
                        logging.info(f"Transaction {
                                     transaction_hash} already exists, skipping.")
        else:
            logging.error(
                f"Failed to fetch transactions or no transactions found for wallet {
                    address}."
            )


@deposits_bp.route('/update-usdt-balances', methods=['POST'])
def update_usdt_balances():
    try:
        logging.info("Starting USDT balance update.")
        process_deposits()
        db.session.commit()
        logging.info("USDT balances updated successfully.")
        return jsonify({"message": "USDT balances updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating USDT balances: {str(e)}")
        return jsonify({"error": "An error occurred while updating balances"}), 500
