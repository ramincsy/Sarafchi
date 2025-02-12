import { useState, useEffect } from 'react'
import PriceService from 'services/PriceService'

// هوک عمومی برای دریافت قیمت USDT
const useUSDTPrice = (type = 'sell') => {
  const [price, setPrice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true)
        const response = await PriceService.fetchUSDTPrice(type)

        // بررسی معتبر بودن داده‌ها
        if (response !== null && typeof response === 'number') {
          setPrice(response) // تنظیم قیمت
        } else {
          throw new Error('داده دریافتی از سرور نامعتبر است.')
        }
      } catch (err) {
        console.error('خطا در دریافت قیمت:', err.message)
        setError(err.message || 'خطا در دریافت قیمت')
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
  }, [type]) // فقط زمانی که type تغییر کند، هوک دوباره اجرا می‌شود

  return { price, loading, error }
}

export default useUSDTPrice
