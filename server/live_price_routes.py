from flask import Blueprint, jsonify
import requests
from bs4 import BeautifulSoup

live_price_bp = Blueprint('live_price', __name__, url_prefix='/api')

@live_price_bp.route('/live-price', methods=['GET'])
def get_live_price():
    try:
        html = requests.get("https://abantether.com/coin/USDT")
        soup = BeautifulSoup(html.text, 'html.parser')
        target_div = soup.find('div', class_='Body_row__ta6o9')
        if target_div:
            buyPrice = target_div.find('p', class_='text-salte-900 text-[salte-900] Text_nowrap__5jEFO Text_title-small__8t9nb undefined').get_text()
            price = int(buyPrice.replace(',', ''))
            return jsonify({"success": True, "price": price}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
