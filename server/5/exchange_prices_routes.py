import aiohttp
import asyncio
from flask import Blueprint, jsonify, make_response
from bs4 import BeautifulSoup

# ایجاد Blueprint برای این ماژول
exchange_prices_bp = Blueprint('exchange_prices', __name__)

# URL صفحه
url = 'https://www.tgju.org/crypto/exchanges/local'

# شبیه‌سازی هدرهای مرورگر
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://www.google.com",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
}

async def fetch_html(session):
    # ارسال درخواست HTTP با هدر شبیه‌سازی شده
    async with session.get(url, headers=HEADERS) as response:
        return await response.text()

async def scrape_exchange_prices():
    async with aiohttp.ClientSession() as session:
        html_content = await fetch_html(session)

    soup = BeautifulSoup(html_content, 'html.parser')

    rows = soup.find_all('tr', class_='pointer')

    results = []
    for row in rows:
        # استخراج نام صرافی
        exchange_name_tag = row.find('a', class_='exchange-title')
        exchange_name = exchange_name_tag.text.strip() if exchange_name_tag else "نام صرافی یافت نشد"

        # استخراج قیمت usdt-sell
        usdt_sell_cell = row.find('td', {'data-currency-value': 'usdt-sell'})
        usdt_sell_price = usdt_sell_cell.text.strip().replace(',', '') if usdt_sell_cell else "قیمت یافت نشد"

        results.append({
            "exchange_name": exchange_name,
            "usdt_sell_price": usdt_sell_price
        })

    return results

@exchange_prices_bp.route('/exchange-prices', methods=['GET'])
def get_exchange_prices():
    try:
        data = asyncio.run(scrape_exchange_prices())

        # غیرفعال کردن کش در پاسخ HTTP
        response = make_response(jsonify({"success": True, "data": data}), 200)
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

        return response
    except Exception as e:
        print(f"Error: {str(e)}")  # برای دیباگ
        return jsonify({"success": False, "error": str(e)}), 500
