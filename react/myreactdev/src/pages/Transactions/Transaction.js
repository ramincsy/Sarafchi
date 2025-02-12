import React, { useState, useEffect, useContext } from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AuthContext from 'contexts/AuthContext'
import ApiManager from 'services/ApiManager'
import AdvancedTable from 'components/tables/AdvancedTable'
import LeverSlider from 'components/common/LeverSlider' // مسیر صحیح فایل LeverSlider
import useUSDTPrice from 'hooks/useUSDTPrice' // فراخوانی هوک

const Transaction = () => {
  // حالت معامله: automatic, suggested, live
  const [mode, setMode] = useState('automatic')
  const [quantity, setQuantity] = useState('')
  const [total, setTotal] = useState(null)
  const [currency, setCurrency] = useState('USDT')
  const [transactionType, setTransactionType] = useState('sell')
  const [refreshKey, setRefreshKey] = useState(0)
  const [usdtBalance, setUsdtBalance] = useState(0) // موجودی USDT کاربر
  const [quantityError, setQuantityError] = useState('') // خطای مربوط به تعداد
  // state برای قیمت دستی در حالت‌های live و suggested
  const [manualPrice, setManualPrice] = useState('')

  const theme = useTheme()
  const { userInfo } = useContext(AuthContext)
  const userId = userInfo?.UserID || 1

  // دریافت قیمت از API (فقط برای حالت automatic)
  const {
    price,
    loading: priceLoading,
    error: priceError,
  } = useUSDTPrice('sell')

  // واکشی موجودی USDT کاربر
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const data = await ApiManager.BalancesService.fetchBalances(userId)
        if (data.success && Array.isArray(data.balances)) {
          const usdt =
            data.balances.find(item => item.CurrencyType === 'USDT')
              ?.NetBalance || 0
          setUsdtBalance(usdt)
        }
      } catch (error) {
        console.error('خطا در دریافت موجودی USDT:', error)
      }
    }
    fetchBalances()
  }, [userId])

  // تعیین قیمت مؤثر بر اساس حالت:
  // در حالت automatic از قیمت دریافتی (price) و در حالت‌های live/suggested از قیمت دستی (manualPrice) استفاده می‌شود
  const effectivePrice = mode === 'automatic' ? price : manualPrice || price

  // به‌روزرسانی مجموع (total) بر اساس تعداد و قیمت مؤثر
  useEffect(() => {
    if (
      effectivePrice !== null &&
      quantity !== '' &&
      !isNaN(effectivePrice) &&
      !isNaN(quantity)
    ) {
      setTotal(parseFloat(quantity) * parseFloat(effectivePrice))
    } else {
      setTotal(null)
    }
  }, [effectivePrice, quantity])

  // تغییر دستی تعداد (ورودی کاربر)
  const handleQuantityChange = e => {
    const value = e.target.value
    if (!isNaN(value)) {
      const parsedValue = parseFloat(value)
      if (parsedValue > usdtBalance) {
        setQuantityError('مقدار وارد شده بیشتر از موجودی USDT شما است.')
      } else {
        setQuantityError('')
        setQuantity(parsedValue)
      }
    } else {
      setQuantityError('لطفاً یک عدد معتبر وارد کنید.')
    }
  }

  // دریافت مقدار محاسبه‌شده توسط LeverSlider
  const handleSliderQuantityChange = calculatedQuantity => {
    // در حالت live و suggested مقدار به عدد صحیح گرد می‌شود
    let newQuantity = calculatedQuantity
    if (mode === 'live' || mode === 'suggested') {
      newQuantity = Math.floor(calculatedQuantity)
    }
    if (newQuantity > usdtBalance) {
      setQuantityError('مقدار وارد شده بیشتر از موجودی USDT شما است.')
    } else {
      setQuantityError('')
      setQuantity(newQuantity)
    }
  }

  // واکشی داده‌ها برای نمایش تاریخچه تراکنش‌ها
  const fetchData = async () => {
    try {
      const data = await ApiManager.TransactionsService.fetchTransactions()
      return data.map((transaction, index) => ({
        WithdrawalID: transaction.TransactionID || index,
        UserID: transaction.UserID,
        Amount: transaction.Quantity,
        Currency: transaction.CurrencyType,
        Price: transaction.Price,
        Total: transaction.Quantity * transaction.Price,
        Date: new Date(transaction.TransactionDateTime).toLocaleString('fa-IR'),
        Status: transaction.Status || 'Unknown',
      }))
    } catch (error) {
      console.error('خطا در دریافت تراکنش‌ها:', error)
      return []
    }
  }

  // ستون‌های جدول
  const columns = [
    { field: 'WithdrawalID', label: 'شناسه' },
    { field: 'UserID', label: 'کاربر' },
    { field: 'Amount', label: 'مقدار' },
    { field: 'Currency', label: 'ارز' },
    { field: 'Price', label: 'قیمت' },
    { field: 'Total', label: 'مجموع' },
    { field: 'Date', label: 'تاریخ' },
    { field: 'Status', label: 'وضعیت' },
  ]

  // ثبت تراکنش جدید
  const handleSubmit = async e => {
    e.preventDefault()
    if (quantityError) {
      alert(quantityError)
      return
    }
    // در حالت‌های live و suggested باید قیمت وارد شده معتبر باشد
    if (
      (mode === 'live' || mode === 'suggested') &&
      (!manualPrice || isNaN(manualPrice))
    ) {
      alert('لطفاً یک قیمت معتبر وارد کنید.')
      return
    }

    let txType = ''
    if (mode === 'automatic') {
      txType = 'Automatic'
    } else if (mode === 'live') {
      txType = 'Live'
    } else if (mode === 'suggested') {
      txType = 'Suggested'
    }

    const transactionData = {
      UserID: userInfo?.user_id || 1,
      Quantity: parseFloat(quantity),
      Price: parseFloat(effectivePrice),
      TransactionType: txType,
      Position: transactionType === 'buy' ? 'Buy' : 'Sell',
      CurrencyType: currency,
      CreatedBy: userId,
    }

    try {
      await ApiManager.TransactionsService.createTransaction(transactionData)
      alert('تراکنش با موفقیت ثبت شد')
      setQuantity('')
      setTotal(null)
      if (mode !== 'automatic') setManualPrice('')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      alert('خطا در ثبت تراکنش')
    }
  }

  // تنظیم عنوان فیلد قیمت بر اساس حالت mode
  let priceLabel = ''
  if (mode === 'automatic') {
    priceLabel = 'قیمت (از API)'
  } else if (mode === 'live') {
    priceLabel = 'قیمت (دستی)'
  } else if (mode === 'suggested') {
    priceLabel = 'قیمت (پیشنهاد)'
  }

  return (
    <Grid container spacing={2} padding={1}>
      {/* ستون فرم و نوار تغییر حالت معامله */}
      <Grid item xs={12} md={4}>
        {/* نوار تغییر حالت معامله به اندازه فرم */}
        <ToggleButtonGroup
          color='primary'
          value={mode}
          exclusive
          onChange={(e, newMode) => {
            if (newMode !== null) setMode(newMode)
          }}
          sx={{
            width: '100%',
            mt: 0.5, // فاصله کمی از بالای صفحه
            mb: 1, // فاصله از پایین نوار تغییر حالت
            borderRadius: 1,
            '& .MuiToggleButton-root': { fontSize: '0.8rem', px: 1, py: 0.5 },
          }}
        >
          <ToggleButton value='automatic'>اتوماتیک</ToggleButton>
          <ToggleButton value='suggested'>پیشنهادی</ToggleButton>
          <ToggleButton value='live'>روی خط</ToggleButton>
        </ToggleButtonGroup>

        {/* فرم ثبت تراکنش */}
        <Paper
          elevation={3}
          sx={{
            padding: 2, // کاهش پدینگ برای فرم
            backgroundColor: theme.palette.background.paper,
            maxHeight: 'calc(100vh - 100px)',
            overflow: 'auto',
          }}
        >
          <Typography
            variant='h6'
            gutterBottom
            color={theme.palette.text.primary}
            sx={{ fontSize: '1rem', mb: 1 }}
          >
            ثبت معامله جدید (
            {mode === 'automatic'
              ? 'اتوماتیک'
              : mode === 'suggested'
              ? 'پیشنهادی'
              : mode === 'live'
              ? 'روی خط'
              : 'ناشناس'}
            )
          </Typography>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin='dense' size='small'>
              <InputLabel sx={{ fontSize: '0.8rem' }}>نوع معامله</InputLabel>
              <Select
                value={transactionType}
                onChange={e => setTransactionType(e.target.value)}
                size='small'
                sx={{ fontSize: '0.8rem' }}
              >
                <MenuItem value='sell' sx={{ fontSize: '0.8rem' }}>
                  فروش
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin='dense' size='small'>
              <InputLabel sx={{ fontSize: '0.8rem' }}>نوع ارز</InputLabel>
              <Select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                size='small'
                sx={{ fontSize: '0.8rem' }}
              >
                <MenuItem value='USDT' sx={{ fontSize: '0.8rem' }}>
                  USDT
                </MenuItem>
              </Select>
            </FormControl>
            <TextField
              label='تعداد'
              type='number'
              fullWidth
              margin='dense'
              size='small'
              value={quantity || ''}
              onChange={handleQuantityChange}
              error={!!quantityError}
              helperText={quantityError}
              sx={{ fontSize: '0.8rem' }}
            />
            <LeverSlider
              price={mode === 'automatic' ? price : manualPrice || price}
              currency='USDT'
              mode={mode}
              quantity={quantity}
              onQuantityChange={handleSliderQuantityChange}
              sx={{ fontSize: '0.8rem', mt: 1 }}
            />
            <TextField
              label={priceLabel}
              fullWidth
              margin='dense'
              size='small'
              value={
                mode === 'automatic'
                  ? price !== null
                    ? price
                    : 'در حال بارگذاری...'
                  : manualPrice
              }
              onChange={
                mode === 'automatic'
                  ? undefined
                  : e => setManualPrice(e.target.value)
              }
              InputProps={{ readOnly: mode === 'automatic' }}
              sx={{ fontSize: '0.8rem' }}
            />
            <TextField
              label='مجموع'
              fullWidth
              margin='dense'
              size='small'
              value={total !== null ? total : 'در حال محاسبه...'}
              InputProps={{ readOnly: true }}
              sx={{ fontSize: '0.8rem' }}
            />
            <Button
              type='submit'
              variant='contained'
              color='primary'
              fullWidth
              sx={{ mt: 1, fontSize: '0.8rem', py: 1 }}
            >
              ثبت معامله
            </Button>
          </form>
        </Paper>
      </Grid>

      {/* جدول تاریخچه تراکنش‌ها */}
      <Grid item xs={12} md={8}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant='h6' sx={{ fontSize: '1rem' }}>
              تاریخچه معاملات
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              overflowY: 'auto',
              maxHeight: '50vh',
            }}
          >
            <AdvancedTable
              key={refreshKey}
              columns={columns}
              fetchData={fetchData}
              defaultPageSize={10}
            />
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>
  )
}

export default Transaction
