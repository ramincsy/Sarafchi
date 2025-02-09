import threading
import time
import logging
import base58
from flask import Blueprint, jsonify
# from datetime import datetime
from Iran_DateTime import get_iran_time
from user_models import db, WalletsUSDT

logging.basicConfig(
    filename="logfile.log",
    level=logging.DEBUG,  # تغییر سطح لاگ به DEBUG برای ثبت جزئیات بیشتر
    format="%(asctime)s - %(levelname)s - %(message)s"
)

balances_bp2 = Blueprint("balances", __name__)

API_KEYS = [
    "45aecaf1-6bd3-4618-a1f6-d06d4c3ff9ba",
    "b4105517-c59e-4900-904e-9a731fe1625e",
    "a45effb7-3709-4d5e-bdfc-0268a3d7bb30"
]
MAX_REQUESTS_PER_SECOND = 9
semaphore = threading.Semaphore(MAX_REQUESTS_PER_SECOND)
api_key_index = 0
api_key_lock = threading.Lock()

# آدرس قرارداد USDT در شبکه ترون
USDT_CONTRACT_ADDRESS = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"


def fetch(url, headers, json):
    import requests
    logging.debug(f"Fetching data with payload: {json}")
    response = requests.post(url, headers=headers, json=json)
    logging.debug(f"Response received: {response.json()}")
    return response.json()


def get_balance_trc20(address, contract):
    global api_key_index
    with api_key_lock:
        api_key = API_KEYS[api_key_index]
        api_key_index = (api_key_index + 1) % len(API_KEYS)

    try:
        logging.debug(f"Using API key: {api_key}")
        api_url = "https://api.trongrid.io/wallet/triggerconstantcontract"
        headers = {
            "Content-Type": "application/json",
            "TRON-PRO-API-KEY": api_key
        }

        # تبدیل آدرس به هگزادسیمال
        owner_address_hex = base58.b58decode_check(address).hex()
        contract_address_hex = base58.b58decode_check(contract).hex()
        logging.debug(f"Address in hex: {owner_address_hex}, Contract in hex: {
                      contract_address_hex}")

        # ساخت payload با آدرس‌های تبدیل‌شده
        payload = {
            "owner_address": owner_address_hex,
            "contract_address": contract_address_hex,
            "function_selector": "balanceOf(address)",
            # حذف پیشوند '41' برای آدرس TRON
            "parameter": "0" * 24 + owner_address_hex[2:]
        }

        logging.debug(f"Fetching data with payload: {payload}")
        data = fetch(api_url, headers, payload)
        logging.debug(f"Response received: {data}")

        # بررسی نتیجه API
        if data["result"].get("result", None):
            val = data["constant_result"][0]
            result = int(val, 16) / 1000000
            logging.debug(f"Balance for address {address}: {result} USDT")
            return result
        else:
            error_msg = bytes.fromhex(data["result"]["message"]).decode()
            logging.error(f"API Error for address {address}: {error_msg}")
    except Exception as e:
        logging.error(f"Exception occurred while fetching balance for address {
                      address}: {str(e)}")
        return None


def worker(wallet, contract):
    with semaphore:
        try:
            logging.debug(f"Processing wallet: {wallet.WalletAddress}")
            balance = get_balance_trc20(wallet.WalletAddress, contract)
            if balance is not None:
                wallet.Balance = balance
                wallet.LastUpdated = get_iran_time()
                logging.info(f"Updated wallet {
                             wallet.WalletAddress} with balance {balance} USDT")
            else:
                logging.error(f"Failed to fetch balance for wallet: {
                              wallet.WalletAddress}")
        except Exception as e:
            logging.error(f"Error in worker for wallet {
                          wallet.WalletAddress}: {str(e)}")
        finally:
            time.sleep(1 / (MAX_REQUESTS_PER_SECOND / len(API_KEYS)))


@balances_bp2.route("/update-balances", methods=["POST"])
def update_balances():
    try:
        wallets = WalletsUSDT.query.all()
        if not wallets:
            logging.warning("No wallets found in the database.")
            return jsonify({"message": "No wallets found."}), 404

        logging.info(f"Found {len(wallets)} wallets to process.")
        threads = []
        for wallet in wallets:
            logging.debug(f"Creating thread for wallet: {
                          wallet.WalletAddress}")
            thread = threading.Thread(
                target=worker, args=(wallet, USDT_CONTRACT_ADDRESS))
            threads.append(thread)
            thread.start()

        for thread in threads:
            thread.join()

        db.session.commit()
        logging.info("Balances updated successfully.")
        return jsonify({"message": "Balances updated successfully."}), 200

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error in update_balances: {str(e)}")
        return jsonify({"error": "An error occurred while updating balances."}), 500
