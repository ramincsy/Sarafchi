import requests
import xml.etree.ElementTree as ET
import threading
import time
import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

# تنظیمات API
API_KEY = "7A5LJYKOZEPS"
BASE_URL = "https://api.timezonedb.com/v2.1/get-time-zone"

# تنظیمات logging جهت ثبت اطلاعات و خطاها
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

class TehranTimeProvider:
    """
    این کلاس مسئول دریافت زمان فعلی تهران از API TimeZoneDB و مدیریت محاسبه زمان جاری است.
    ویژگی‌های این کلاس:
      - دریافت زمان از API به صورت XML.
      - ذخیره‌ی زمان دریافتی از API به همراه زمان سیستم در زمان دریافت.
      - به‌روزرسانی دوره‌ای (به‌طور پیش‌فرض هر ۵ دقیقه) زمان از API.
      - محاسبه‌ی زمان جاری به صورت پیوسته با استفاده از اختلاف زمان سیستم.
    """
    def __init__(self, refresh_interval_seconds=300):
        # بازه به‌روزرسانی به صورت پیش‌فرض ۵ دقیقه (300 ثانیه)
        self.refresh_interval_seconds = refresh_interval_seconds
        
        # زمان دریافتی از API (api_time) و زمان سیستم در لحظه دریافت (fetch_system_time)
        self.api_time = None
        self.fetch_system_time = None
        
        self.lock = threading.Lock()
        # راه‌اندازی رشته پس‌زمینه جهت به‌روزرسانی دوره‌ای
        self.thread = threading.Thread(target=self._background_update, daemon=True)
        self.thread.start()

    def _background_update(self):
        """به‌روزرسانی دوره‌ای زمان از API در یک رشته جداگانه."""
        while True:
            try:
                new_api_time = self.fetch_time()
                # استفاده از زمان سیستم ایستانبول به عنوان مرجع
                new_fetch_system_time = datetime.now(ZoneInfo("Europe/Istanbul"))
                with self.lock:
                    self.api_time = new_api_time  # زمان دریافتی از API (Asia/Tehran)
                    self.fetch_system_time = new_fetch_system_time  # زمان سیستم ایستانبول
                logger.info("زمان API به‌روزرسانی شد: %s (دریافتی در %s)", new_api_time, new_fetch_system_time)
            except Exception as e:
                logger.error("خطا در به‌روزرسانی زمان: %s", e)
            time.sleep(self.refresh_interval_seconds)

    def fetch_time(self):
        """
        دریافت زمان تهران از API TimeZoneDB و بازگرداندن یک شیء datetime با منطقه زمانی Asia/Tehran.
        """
        params = {
            "key": API_KEY,
            "format": "xml",
            "by": "zone",
            "zone": "Asia/Tehran"
        }
        response = requests.get(BASE_URL, params=params, timeout=10)
        if response.status_code != 200:
            raise Exception(f"HTTP Error: {response.status_code}")

        root = ET.fromstring(response.text)
        status = root.find("status").text
        if status != "OK":
            message = root.find("message").text
            raise Exception(f"API Error: {message}")

        formatted_time = root.find("formatted").text  # مانند "2025-02-09 13:42:41"
        api_time = datetime.strptime(formatted_time, "%Y-%m-%d %H:%M:%S")
        api_time = api_time.replace(tzinfo=ZoneInfo("Asia/Tehran"))
        return api_time

    def get_current_time(self):
        """
        محاسبه و بازگرداندن زمان فعلی تهران به صورت پیوسته.
        اگر زمان از API در کش موجود باشد، با استفاده از اختلاف زمانی بر اساس زمان سیستم ایستانبول، زمان جاری را محاسبه می‌کند.
        """
        with self.lock:
            if self.api_time is None or self.fetch_system_time is None:
                # اگر هنوز زمان کش نشده است، به صورت همزمان از API دریافت می‌شود.
                new_api_time = self.fetch_time()
                self.api_time = new_api_time
                self.fetch_system_time = datetime.now(ZoneInfo("Europe/Istanbul"))
                return new_api_time

            now_system = datetime.now(ZoneInfo("Europe/Istanbul"))
            elapsed = now_system - self.fetch_system_time
            current_time = self.api_time + elapsed
            return current_time

# ایجاد یک شیء سراسری جهت استفاده در سایر قسمت‌های برنامه
iran_time_provider = TehranTimeProvider()

def get_iran_time():
    """
    تابع کمکی جهت دریافت زمان فعلی تهران به عنوان یک شیء datetime.
    """
    return iran_time_provider.get_current_time()
