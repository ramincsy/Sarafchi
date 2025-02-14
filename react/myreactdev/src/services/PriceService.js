import axiosInstance from 'utils/axiosInstance'

const PriceService = {
  /**
   * دریافت قیمت USDT (خرید یا فروش).
   * @param {string} type - نوع قیمت ('buy' یا 'sell')
   * @returns {Promise<object>} - داده‌های قیمت
   */
  fetchUSDTPrice: async (type = 'buy') => {
    try {
      // ارسال درخواست به API با پارامتر type
      const response = await axiosInstance.get('/live-price', {
        params: { type }, // ارسال پارامتر type به API
        timeout: 10000, // زمان انتظار حداکثر 10 ثانیه
      })

      // بررسی وضعیت پاسخ
      if (response.data.success) {
        return response.data.price // برگرداندن قیمت
      } else {
        throw new Error(response.data.error || 'خطای ناشناخته')
      }
    } catch (error) {
      // مدیریت خطاهای مختلف
      if (error.response) {
        // خطاهای HTTP (مانند 404 یا 500)
        console.error(
          `خطای HTTP: ${error.response.status} - ${
            error.response.data?.error || 'خطای سرور'
          }`,
        )
      } else if (error.request) {
        // درخواست ارسال شده اما پاسخی دریافت نشده است
        console.error('خطا: پاسخی از سرور دریافت نشد.')
      } else {
        // خطاهای دیگر
        console.error(`خطا: ${error.message}`)
      }

      // برگرداندن یک مقدار پیش‌فرض یا پیام خطا
      return null
    }
  },
}

export default PriceService
