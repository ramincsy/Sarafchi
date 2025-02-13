import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from 'react'
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  CircularProgress,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AuthContext from 'contexts/AuthContext'
import ApiManager from 'services/ApiManager'
import AdvancedTable from 'components/tables/AdvancedTable'
import LeverSlider from 'components/common/LeverSlider' // مسیر صحیح فایل LeverSlider
import PriceService from 'services/PriceService'

/* ConfirmDialog: دیالوگ تأیید نهایی معامله با تایمر دایره‌ای سبز رنگ */
const ConfirmDialog = ({
  open,
  onClose,
  confirmPrice,
  countdown,
  totalTime = 10,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { padding: 2, borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
        تأیید نهایی معامله
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <DialogContentText>قیمت جدید: {confirmPrice}</DialogContentText>
        <Box display='flex' flexDirection='column' alignItems='center' mt={2}>
          <Box position='relative' display='inline-flex'>
            <CircularProgress
              variant='determinate'
              value={(countdown / totalTime) * 100}
              size={80}
              sx={{ color: 'green' }}
            />
            <Box
              position='absolute'
              top={0}
              left={0}
              bottom={0}
              right={0}
              display='flex'
              alignItems='center'
              justifyContent='center'
            >
              <Typography variant='h6' component='div' color='text.primary'>
                {countdown}
              </Typography>
            </Box>
          </Box>
          <Typography variant='body2' sx={{ mt: 1 }}>
            لطفاً در عرض {totalTime} ثانیه تأیید کنید.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button onClick={onClose} color='error' variant='outlined'>
          لغو
        </Button>
        <Button
          onClick={onConfirm}
          color='success'
          variant='contained'
          autoFocus
        >
          تأیید
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const Transaction = () => {
  const [mode, setMode] = useState('automatic')
  const [quantity, setQuantity] = useState('')
  const [total, setTotal] = useState(null)
  const [currency, setCurrency] = useState('USDT')
  const [transactionType, setTransactionType] = useState('sell')
  const [refreshKey, setRefreshKey] = useState(0)
  const [usdtBalance, setUsdtBalance] = useState(0)
  const [quantityError, setQuantityError] = useState('')
  const [manualPrice, setManualPrice] = useState('')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmPrice, setConfirmPrice] = useState(null)
  const [countdown, setCountdown] = useState(10)

  const theme = useTheme()
  const { userInfo } = useContext(AuthContext)
  const userId = userInfo?.UserID || 1

  // دریافت قیمت دلار از سرویس (Polling: هر 10 ثانیه)
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await PriceService.fetchUSDTPrice('sell')
        if (response !== null && typeof response === 'number') {
          setPrice(response)
        } else {
          throw new Error('داده دریافتی از سرور نامعتبر است.')
        }
      } catch (err) {
        console.error('خطا در دریافت قیمت:', err.message)
      }
    }
    fetchPrice()
    const interval = setInterval(fetchPrice, 10000)
    return () => clearInterval(interval)
  }, [])

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

  const effectivePrice = useMemo(() => {
    return mode === 'automatic' ? price : manualPrice || price
  }, [mode, price, manualPrice])

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

  const handleQuantityChange = useCallback(
    e => {
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
    },
    [usdtBalance],
  )

  const handleSliderQuantityChange = useCallback(
    calculatedQuantity => {
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
    },
    [mode, usdtBalance],
  )

  const fetchData = useCallback(async () => {
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
  }, [])

  const columns = useMemo(
    () => [
      { field: 'WithdrawalID', label: 'شناسه' },
      { field: 'UserID', label: 'کاربر' },
      { field: 'Amount', label: 'مقدار' },
      { field: 'Currency', label: 'ارز' },
      { field: 'Price', label: 'قیمت' },
      { field: 'Total', label: 'مجموع' },
      { field: 'Date', label: 'تاریخ' },
      { field: 'Status', label: 'وضعیت' },
    ],
    [],
  )

  // تعریف آستانه برای مقایسه قیمت (به عنوان مثال 0.01) اگر قیمت بالارفت کاری نداشته باشم  اگر قیمت پایین امد  در لحظه  نوتفیکیشن
  const priceThreshold = 0.01

  const finalizeTransaction = useCallback(async () => {
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
      Price: parseFloat(confirmPrice || effectivePrice),
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
      // بستن دیالوگ تأیید پس از ثبت موفق
      setConfirmDialogOpen(false)
    } catch (error) {
      alert('خطا در ثبت تراکنش')
    }
  }, [
    mode,
    confirmPrice,
    effectivePrice,
    quantity,
    transactionType,
    currency,
    userId,
    userInfo,
  ])

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault()
      if (quantityError) {
        alert(quantityError)
        return
      }
      if (
        (mode === 'live' || mode === 'suggested') &&
        (!manualPrice || isNaN(manualPrice))
      ) {
        alert('لطفاً یک قیمت معتبر وارد کنید.')
        return
      }

      if (mode === 'automatic') {
        try {
          // دریافت مجدد قیمت
          const fetchedPrice = await PriceService.fetchUSDTPrice('sell')
          console.log('قیمت جدید دریافت شد:', fetchedPrice)
          // مقایسه قیمت جدید با قیمت فعلی فرم (effectivePrice)
          if (Math.abs(fetchedPrice - effectivePrice) < priceThreshold) {
            // اگر قیمت تغییر نکرده باشد، دیالوگ تأیید نمایش داده می‌شود
            setConfirmPrice(fetchedPrice)
            setConfirmDialogOpen(true)
            setCountdown(10)
            const timer = setInterval(() => {
              setCountdown(prev => (prev > 0 ? prev - 1 : 0))
            }, 1000)
            setTimeout(() => {
              clearInterval(timer)
              setConfirmDialogOpen(false)
            }, 10000)
          } else {
            // اگر قیمت تغییر کرده باشد، قیمت جدید به‌روز شده و مجموع محاسبه می‌شود
            setPrice(fetchedPrice)
            alert('قیمت تغییر کرده است. لطفاً دوباره دکمه ثبت معامله را بزنید.')
          }
        } catch (error) {
          console.error('خطا در دریافت قیمت جدید:', error)
          alert('خطا در دریافت قیمت جدید')
        }
      } else {
        await finalizeTransaction()
      }
    },
    [
      mode,
      quantityError,
      manualPrice,
      quantity,
      transactionType,
      currency,
      userId,
      userInfo,
      finalizeTransaction,
      effectivePrice,
    ],
  )

  const priceLabel = useMemo(() => {
    if (mode === 'automatic') {
      return 'قیمت (از API)'
    } else if (mode === 'live') {
      return 'قیمت (دستی)'
    } else if (mode === 'suggested') {
      return 'قیمت (پیشنهاد)'
    }
    return ''
  }, [mode])

  return (
    <Grid container spacing={2} padding={1}>
      <Grid item xs={12} md={4}>
        <ToggleButtonGroup
          color='primary'
          value={mode}
          exclusive
          onChange={(e, newMode) => {
            if (newMode !== null) setMode(newMode)
          }}
          sx={{
            width: '100%',
            mt: 0.5,
            mb: 1,
            borderRadius: 1,
            '& .MuiToggleButton-root': { fontSize: '0.8rem', px: 1, py: 0.5 },
          }}
        >
          <ToggleButton value='automatic'>اتوماتیک</ToggleButton>
          <ToggleButton value='suggested'>پیشنهادی</ToggleButton>
          <ToggleButton value='live'>فردایی</ToggleButton>
        </ToggleButtonGroup>

        <Paper
          elevation={3}
          sx={{
            padding: 2,
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

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        confirmPrice={confirmPrice}
        countdown={countdown}
        onConfirm={finalizeTransaction}
      />
    </Grid>
  )
}

export default Transaction
