import React, { useState, useEffect, useContext } from 'react'
import { Slider, Typography, Box } from '@mui/material'
import BalancesService from 'services/BalancesService'
import AuthContext from 'contexts/AuthContext'

/**
 * LeverSlider
 *
 * @param {string} currency - ارز مورد نظر برای فروش (مثلاً "USD")
 * @param {function} onQuantityChange - تابعی که تعداد محاسبه‌شده را به کامپوننت پدر ارسال می‌کند
 *
 * توضیح:
 * این اسلایدر برای تعیین تعداد ارز جهت فروش می‌باشد.
 * به عنوان مثال، اگر موجودی کاربر ۱۰۰۰ دلار باشد و کاربر اسلایدر را روی ۵۰ درصد قرار دهد،
 * تعداد محاسبه‌شده ۵۰۰ دلار خواهد بود.
 */
const LeverSlider = ({ currency, onQuantityChange }) => {
  const [balance, setBalance] = useState(0)
  const [percentage, setPercentage] = useState(0)
  const [maxQuantity, setMaxQuantity] = useState(0)

  const { userInfo } = useContext(AuthContext)
  const userId = userInfo?.UserID || 1

  // ارز موجودی که باید واکشی شود؛ در اینجا همان ارز مورد معامله (مثلاً "USD") است.
  const balanceCurrencyType = currency

  // واکشی موجودی کاربر از سرور
  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        const response = await BalancesService.fetchBalances(userId)
        const balanceObj = response.balances.find(
          item => item.CurrencyType === balanceCurrencyType,
        )
        // اگر موجودی برای ارز مورد نظر پیدا نشد، موجودی صفر در نظر گرفته می‌شود.
        setBalance(balanceObj ? balanceObj.WithdrawableBalance : 0)
      } catch (error) {
        console.error('خطا در واکشی موجودی کاربر:', error)
        setBalance(0)
      }
    }

    fetchUserBalance()
  }, [userId, balanceCurrencyType])

  // حداکثر تعداد قابل فروش برابر با موجودی کاربر است.
  useEffect(() => {
    setMaxQuantity(balance)
  }, [balance])

  // هنگامی که کاربر اسلایدر را حرکت می‌دهد، درصد انتخاب شده را گرفته و تعداد محاسبه می‌شود.
  const handleSliderChange = (event, newValue) => {
    setPercentage(newValue)
    const calculatedQuantity = maxQuantity * (newValue / 100)
    onQuantityChange(calculatedQuantity)
  }

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography gutterBottom>انتخاب درصد موجودی ( {percentage}% )</Typography>
      <Slider
        value={percentage}
        onChange={handleSliderChange}
        aria-labelledby='balance-slider'
        valueLabelDisplay='auto'
        step={1}
        marks
        min={0}
        max={100}
      />
      <Typography variant='caption'>
        حداکثر مقدار قابل فروش: {balance} {balanceCurrencyType}
      </Typography>
    </Box>
  )
}

export default LeverSlider
