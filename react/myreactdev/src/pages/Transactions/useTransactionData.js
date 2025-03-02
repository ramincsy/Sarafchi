// useTransactionData.js
import { useState, useEffect } from "react";
import PriceService from "services/PriceService";
import ApiManager from "services/ApiManager";

/**
 * یک هوک برای گرفتن قیمت فعلی USDT و موجودی کاربر.
 * @param {number} userId شناسه کاربر
 */
export function useTransactionData(userId) {
  const [price, setPrice] = useState(null);
  const [usdtBalance, setUsdtBalance] = useState(0);

  // هر 10 ثانیه قیمت را به‌روزرسانی می‌کنیم
  useEffect(() => {
    let intervalId;
    const fetchPrice = async () => {
      try {
        const response = await PriceService.fetchUSDTPrice("sell");
        if (response !== null && typeof response === "number") {
          setPrice(response);
        } else {
          throw new Error("داده دریافتی از سرور نامعتبر است.");
        }
      } catch (err) {
        console.error("خطا در دریافت قیمت:", err.message);
      }
    };
    fetchPrice();
    intervalId = setInterval(fetchPrice, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // گرفتن موجودی کاربر
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        if (!userId) return;

        // دریافت موجودی‌های کاربر از API
        const data = await ApiManager.BalancesService.fetchBalances(userId);
        console.log("Fetched Balances Data:", data); // اضافه کردن این خط

        // بررسی موفقیت‌آمیز بودن درخواست و وجود داده‌های معتبر
        if (data.success && Array.isArray(data.balances)) {
          // پیدا کردن موجودی USDT و تنظیم موجودی قابل برداشت
          const usdtBalance =
            data.balances.find((item) => item.CurrencyType === "USDT")
              ?.WithdrawableBalance || 0;
          setUsdtBalance(usdtBalance);
        } else {
          throw new Error("داده دریافتی از سرور نامعتبر است.");
        }
      } catch (error) {
        console.error("خطا در دریافت موجودی USDT:", error);
      }
    };

    fetchBalances();
  }, [userId]);

  return { price, usdtBalance };
}
