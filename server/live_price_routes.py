from flask import Blueprint, jsonify, request
import time
import logging
import requests
from threading import Thread, Lock
from cachetools import TTLCache
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

# تنظیمات کلی
API_URL = 'https://abantether.com/api/v1/otc/coin-price/'
API_TOKEN = "Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxODMyNTE1IiwiaWF0IjoxNzM5MzY2NzM2LjE3ODk2MjUsImV4cCI6MTc3MDkwMjczNiwic2Vzc2lvbl9pZCI6IjhlNzY1MDliLTQ0ODMtNDM0OS04MjZlLWZlOTI5ZmRjOTkwYiIsInR5cGUiOiJBUEkiLCJyZXF1aXJlZF9sYXllcnMiOnsicGFuZWwiOnsiZGlmZiI6WyJwaG9uZS1vdHAiLCJlbWFpbC1vdHAiXSwidXNlX3BvbGljeSI6IkFMV0FZUyIsImFjdGl2ZSI6e319LCJ3aXRoZHJhd2FsIjp7ImRpZmYiOlsiYXV0aGVudGljYXRvciJdLCJ1c2VfcG9saWN5IjoiUkVTRVQiLCJhY3RpdmUiOnt9fSwid2hpdGVhZGRyZXNzIjp7ImRpZmYiOlsiYXV0aGVudGljYXRvciIsImVtYWlsLW90cCJdLCJ1c2VfcG9saWN5IjoiRVhQSVJFIiwiYWN0aXZlIjp7fX19fQ.E0xSZQ5YfIay7_R4nfn_FqhdctTw-EC3OcY0CTsuM6E"
CACHE_TTL = 10           # زمان انقضا کش (ثانیه)
FAILURE_THRESHOLD = 60   # حد زمانی عدم دریافت موفق (ثانیه)

# ایجاد کش با زمان انقضا
cache = TTLCache(maxsize=1, ttl=CACHE_TTL)

# قفل برای جلوگیری از تداخل درخواست‌ها
lock = Lock()

# متغیر سراسری برای ذخیره آخرین زمان دریافت موفق قیمت
last_successful_fetch = None

# تنظیم یک Session با پیکربندی Retry
session = requests.Session()
retry_strategy = Retry(
    total=3,               # حداکثر 3 تلاش مجدد
    backoff_factor=1,      # فاصله زمانی افزایشی بین تلاش‌ها
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["GET"]
)
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("https://", adapter)
session.mount("http://", adapter)

# تنظیمات لاگ‌گیری
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def fetch_usdt_price():
    """
    دریافت قیمت USDT از API و ذخیره آن در کش.
    در صورت دریافت موفق، زمان دریافت موفق بروزرسانی می‌شود.
    """
    global last_successful_fetch
    headers = {"Authorization": API_TOKEN}
    try:
        with lock:
            response = session.get(API_URL, headers=headers, timeout=10)
            response.raise_for_status()  # بررسی خطاهای HTTP
            data = response.json()

            # استخراج اطلاعات USDT
            usdt_data = data.get('USDT', {})
            if not usdt_data:
                raise ValueError("اطلاعات USDT در پاسخ API وجود ندارد.")

            # ذخیره قیمت‌ها در کش
            cache['usdt_price'] = {
                'buy': float(usdt_data.get('irtPriceBuy', 0)),
                'sell': float(usdt_data.get('irtPriceSell', 0))
            }

            # به‌روزرسانی زمان دریافت موفق
            last_successful_fetch = time.time()
            logging.info("قیمت‌ها با موفقیت به‌روزرسانی شدند.")
    except requests.exceptions.Timeout:
        logging.error("خطا: زمان انتظار برای دریافت پاسخ از API به پایان رسید.")
    except requests.exceptions.ConnectionError:
        logging.error("خطا: اتصال به سرور API برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید.")
    except requests.exceptions.HTTPError as e:
        if response.status_code == 401:
            logging.error("خطا: توکن API نامعتبر است. لطفاً توکن خود را بررسی کنید.")
        else:
            logging.error(f"خطای HTTP: {e}")
    except ValueError as e:
        logging.error(f"خطا در پردازش داده‌ها: {e}")
    except Exception as e:
        logging.error(f"خطای ناشناخته: {e}")

def get_usdt_price(price_type='buy'):
    """
    دریافت قیمت USDT از کش یا API.
    اگر بیش از FAILURE_THRESHOLD ثانیه از آخرین دریافت موفق گذشته باشد،
    پیام "توقف معاملات" برگردانده می‌شود.
    
    :param price_type: نوع قیمت ('buy' یا 'sell')
    :return: قیمت مورد نظر یا پیام "توقف معاملات"
    """
    if price_type not in ['buy', 'sell']:
        return "نوع قیمت باید 'buy' یا 'sell' باشد."

    current_time = time.time()

    # بررسی وجود داده در کش
    cached_data = cache.get('usdt_price')
    if cached_data:
        return cached_data.get(price_type, 0)

    # اگر داده در کش موجود نباشد، تلاش برای دریافت قیمت
    fetch_usdt_price()
    cached_data = cache.get('usdt_price', {})
    if cached_data:
        return cached_data.get(price_type, 0)

    # اگر هیچ داده‌ای دریافت نشد، پیام توقف معاملات را برگردان
    return "توقف معاملات"

def update_prices_periodically():
    """
    به‌روزرسانی قیمت‌ها به صورت دوره‌ای (هر CACHE_TTL ثانیه).
    """
    while True:
        start_time = time.monotonic()
        fetch_usdt_price()
        elapsed_time = time.monotonic() - start_time
        sleep_time = max(0, CACHE_TTL - elapsed_time)  # اطمینان از زمان‌بندی دقیق
        time.sleep(sleep_time)

# راه‌اندازی ترد برای به‌روزرسانی خودکار قیمت‌ها
update_thread = Thread(target=update_prices_periodically, daemon=True)
update_thread.start()

# ایجاد Blueprint برای API
live_price_bp = Blueprint('live_price', __name__, url_prefix='/api')

@live_price_bp.route('/live-price', methods=['GET'])
def live_price():
    """
    دریافت قیمت خرید یا فروش USDT بر اساس پارامتر 'type'.
    :param type: نوع قیمت ('buy' یا 'sell')
    :return: JSON شامل قیمت مورد نظر
    """
    price_type = request.args.get('type', 'buy')  # پیش‌فرض 'buy'
    if price_type not in ['buy', 'sell']:
        return jsonify({"success": False, "error": "نوع قیمت باید 'buy' یا 'sell' باشد."}), 400

    price = get_usdt_price(price_type)
    if price == "توقف معاملات":
        return jsonify({"success": False, "error": "توقف معاملات"}), 503

    return jsonify({"success": True, "price": price}), 200