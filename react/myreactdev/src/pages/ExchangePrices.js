import React, { useEffect, useState } from "react";
import ExchangePricesService from "../services/ExchangePricesService";
import "./ExchangePrices.css"; // فایل CSS

const ExchangePrices = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);

  const fetchData = async () => {
    try {
      const data = await ExchangePricesService.fetchExchangePrices();

      // فیلتر کردن قیمت‌های معتبر (قیمت‌هایی که عدد هستند)
      const validPrices = data.data.filter(
        (item) => !isNaN(parseFloat(item.usdt_sell_price))
      );

      // مرتب‌سازی قیمت‌ها از کمترین به بیشترین
      validPrices.sort(
        (a, b) => parseFloat(a.usdt_sell_price) - parseFloat(b.usdt_sell_price)
      );

      setPrices(validPrices);

      // تنظیم کمترین و بیشترین قیمت
      if (validPrices.length > 0) {
        setMinPrice(validPrices[0]);
        setMaxPrice(validPrices[validPrices.length - 1]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // فراخوانی اولیه
    fetchData();

    // به‌روزرسانی هر 10 ثانیه
    const intervalId = setInterval(fetchData, 1000000);

    // پاکسازی interval در زمان unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div className="loading">در حال بارگذاری...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      {/* نمایش کمترین و بیشترین قیمت */}
      <div className="highlight-boxes">
        <div className="highlight-box min-price">
          <h3>کمترین قیمت</h3>
          {minPrice && (
            <>
              <p className="exchange-name">{minPrice.exchange_name}</p>
              <p className="price">{minPrice.usdt_sell_price} تومان</p>
            </>
          )}
        </div>
        <div className="highlight-box max-price">
          <h3>بیشترین قیمت</h3>
          {maxPrice && (
            <>
              <p className="exchange-name">{maxPrice.exchange_name}</p>
              <p className="price">{maxPrice.usdt_sell_price} تومان</p>
            </>
          )}
        </div>
      </div>

      {/* نمایش لیست قیمت‌ها */}
      <div className="cards">
        {prices.map((price, index) => (
          <div key={index} className="card">
            <h3 className="exchange-name">{price.exchange_name}</h3>
            <p className="price">{price.usdt_sell_price} تومان</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExchangePrices;
