// src/pages/CartModalPage.js
import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material'

// سرویس‌های API – مسیرهای import را مطابق ساختار پروژه خود تنظیم کنید.
import TransactionService from 'services/TransactionService'
import WithdrawalsService from 'services/WithdrawalsService'
import WithdrawalsUSDTService from 'services/WithdrawalsUSDTService'

/*
  تابع کمکی isToday: بررسی می‌کند آیا تاریخ داده‌شده مربوط به امروز است یا خیر.
*/
const isToday = dateString => {
  if (!dateString) return false
  const date = new Date(dateString)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/*  
  توابع کمکی برای دسترسی امن به اطلاعات هر آیتم  
  - اگر آیتم دارای کلیدهای متفاوتی (مانند id، TransactionID، WithdrawalID) باشد از آن استفاده می‌کنیم.
*/
const getItemId = item =>
  item?.WithdrawalID || item?.TransactionID || item?.id || 'N/A'
const getItemUser = item => item?.UserID || item?.user || 'N/A'
const getItemStatus = item => item?.Status || item?.status || 'N/A'
const getItemDate = item => {
  const d =
    item?.CreatedAt ||
    item?.WithdrawalDateTime ||
    item?.TransactionDateTime ||
    item?.date
  return d ? new Date(d).toLocaleString() : 'N/A'
}
const getItemAmount = item => item?.Amount || 'N/A'

/*
  کامپوننت DetailsModal: نمایش جزئیات داده‌های دسته انتخاب‌شده به صورت کارت‌های کوچک
*/
const DetailsModal = ({ open, onClose, title, data }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {data.length === 0 ? (
          <Typography variant='body1'>هیچ داده‌ای موجود نیست.</Typography>
        ) : (
          <Grid container spacing={2}>
            {data.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant='body1'>
                      {`ID: ${getItemId(item)}`}
                    </Typography>
                    <Typography variant='body2'>
                      {`User: ${getItemUser(item)}`}
                    </Typography>
                    <Typography variant='body2'>
                      {`Status: ${getItemStatus(item)}`}
                    </Typography>
                    <Typography variant='body2'>
                      {`Date: ${getItemDate(item)}`}
                    </Typography>
                    <Typography variant='body2'>
                      {`Amount: ${getItemAmount(item)}`}
                    </Typography>
                    {item.DestinationAddress && (
                      <Typography variant='body2'>
                        {`Destination: ${item.DestinationAddress}`}
                      </Typography>
                    )}
                    {item.AccountHolderName && (
                      <Typography variant='body2'>
                        {`Account Holder: ${item.AccountHolderName}`}
                      </Typography>
                    )}
                    {item.IBAN && (
                      <Typography variant='body2'>
                        {`IBAN: ${item.IBAN}`}
                      </Typography>
                    )}
                    {item.CurrencyType && (
                      <Typography variant='body2'>
                        {`Currency: ${item.CurrencyType}`}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>بستن</Button>
      </DialogActions>
    </Dialog>
  )
}

/*
  صفحه اصلی CartModalPage
  دسته‌بندی‌های مورد نظر (تنها اطلاعات امروز):
    1. برداشت ریالی درحال برسی
    2. برداشت تتری درحال برسی
    3. معاملات در حال برسی
    4. برداشت‌های ریالی انجام شده
    5. برداشت‌های تتری انجام شده
    6. معاملات انجام شده
*/
const CartModalPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // حالت‌های مربوط به داده‌های API و وضعیت بارگذاری/خطا
  const [transactionsData, setTransactionsData] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [transactionsError, setTransactionsError] = useState(null)

  const [withdrawalsRialData, setWithdrawalsRialData] = useState([])
  const [withdrawalsRialLoading, setWithdrawalsRialLoading] = useState(true)
  const [withdrawalsRialError, setWithdrawalsRialError] = useState(null)

  const [withdrawalsTetryData, setWithdrawalsTetryData] = useState([])
  const [withdrawalsTetryLoading, setWithdrawalsTetryLoading] = useState(true)
  const [withdrawalsTetryError, setWithdrawalsTetryError] = useState(null)

  // واکشی تراکنش‌ها
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await TransactionService.fetchTransactions()
        const data = response.data ? response.data : response
        console.log('fetchTransactions', data)
        if (Array.isArray(data)) {
          setTransactionsData(data)
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setTransactionsError('خطا در دریافت تراکنش‌ها')
      } finally {
        setTransactionsLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  // واکشی برداشت‌های ریالی
  useEffect(() => {
    const fetchWithdrawalsRial = async () => {
      try {
        const response = await WithdrawalsService.fetchWithdrawals()
        const data = response.data ? response.data : response
        console.log('fetchWithdrawalsRial', data)
        if (Array.isArray(data)) {
          setWithdrawalsRialData(data)
        }
      } catch (error) {
        console.error('Error fetching Rial withdrawals:', error)
        setWithdrawalsRialError('خطا در دریافت برداشت‌های ریالی')
      } finally {
        setWithdrawalsRialLoading(false)
      }
    }
    fetchWithdrawalsRial()
  }, [])

  // واکشی برداشت‌های تتری (USDT)
  useEffect(() => {
    const fetchWithdrawalsTetry = async () => {
      try {
        const response = await WithdrawalsUSDTService.fetchAllWithdrawals()
        const data = response.data ? response.data : response
        console.log('fetchWithdrawalsTetry', data)
        if (Array.isArray(data)) {
          setWithdrawalsTetryData(data)
        }
      } catch (error) {
        console.error('Error fetching Tetry withdrawals:', error)
        setWithdrawalsTetryError('خطا در دریافت برداشت‌های تتری')
      } finally {
        setWithdrawalsTetryLoading(false)
      }
    }
    fetchWithdrawalsTetry()
  }, [])

  // دسته‌بندی اطلاعات امروز:

  // 1. برداشت ریالی درحال برسی: فقط برداشت‌های ریالی که تاریخ WithdrawalDateTime آن‌ها مربوط به امروز باشد و وضعیت Pending یا در حال برسی.
  const withdrawalsUnderReviewRial = useMemo(() => {
    return withdrawalsRialData.filter(w => {
      const status = w.Status
      return (
        w.CurrencyType === 'ريال' &&
        (status === 'Pending' || status === 'در حال برسی') &&
        w.WithdrawalDateTime &&
        isToday(w.WithdrawalDateTime)
      )
    })
  }, [withdrawalsRialData])

  // 2. برداشت تتری درحال برسی: برداشت‌های USDT که CreatedAt آن‌ها مربوط به امروز بوده و وضعیت Pending یا در حال برسی.
  const withdrawalsUnderReviewTetry = useMemo(() => {
    return withdrawalsTetryData.filter(w => {
      const status = w.Status
      return (
        (status === 'Pending' || status === 'در حال برسی') &&
        w.CreatedAt &&
        isToday(w.CreatedAt)
      )
    })
  }, [withdrawalsTetryData])

  // 3. معاملات در حال برسی: تراکنش‌هایی که وضعیت آن‌ها Pending یا در حال برسی بوده و تاریخ آن‌ها امروز است.
  const transactionsUnderReview = useMemo(() => {
    return transactionsData.filter(tx => {
      const status = tx.Status || tx.status
      const dateValue = tx.TransactionDateTime || tx.date
      return (
        (status === 'Pending' || status === 'در حال برسی') &&
        dateValue &&
        isToday(dateValue)
      )
    })
  }, [transactionsData])

  // 4. برداشت‌های ریالی انجام شده: برداشت‌های ریالی که وضعیت Approved/Completed/انجام شده و تاریخ آن‌ها امروز است.
  const completedWithdrawalsRial = useMemo(() => {
    return withdrawalsRialData.filter(w => {
      const status = w.Status
      return (
        w.CurrencyType === 'ريال' &&
        (status === 'Approved' ||
          status === 'Completed' ||
          status === 'انجام شده') &&
        w.WithdrawalDateTime &&
        isToday(w.WithdrawalDateTime)
      )
    })
  }, [withdrawalsRialData])

  // 5. برداشت‌های تتری انجام شده: برداشت‌های USDT که وضعیت Approved/Completed/انجام شده و تاریخ آن‌ها امروز است.
  const completedWithdrawalsTetry = useMemo(() => {
    return withdrawalsTetryData.filter(w => {
      const status = w.Status
      return (
        (status === 'Approved' ||
          status === 'Completed' ||
          status === 'انجام شده') &&
        w.CreatedAt &&
        isToday(w.CreatedAt)
      )
    })
  }, [withdrawalsTetryData])

  // 6. معاملات انجام شده: تراکنش‌هایی که وضعیت Completed/انجام شده و تاریخ آن‌ها امروز است.
  const completedTransactions = useMemo(() => {
    return transactionsData.filter(tx => {
      const status = tx.Status || tx.status
      const dateValue = tx.TransactionDateTime || tx.date
      return (
        (status === 'Completed' || status === 'انجام شده') &&
        dateValue &&
        isToday(dateValue)
      )
    })
  }, [transactionsData])

  // مدیریت مودال جهت نمایش جزئیات هر دسته
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState([])
  const [modalTitle, setModalTitle] = useState('')

  const handleCardClick = cardCategory => {
    let dataToShow = []
    let titleToShow = ''
    switch (cardCategory) {
      case 'withdrawalsUnderReviewRial':
        titleToShow = 'برداشت ریالی درحال برسی'
        dataToShow = withdrawalsUnderReviewRial
        break
      case 'withdrawalsUnderReviewTetry':
        titleToShow = 'برداشت تتری درحال برسی'
        dataToShow = withdrawalsUnderReviewTetry
        break
      case 'transactionsUnderReview':
        titleToShow = 'معاملات در حال برسی'
        dataToShow = transactionsUnderReview
        break
      case 'completedWithdrawalsRial':
        titleToShow = 'برداشت‌های ریالی انجام شده'
        dataToShow = completedWithdrawalsRial
        break
      case 'completedWithdrawalsTetry':
        titleToShow = 'برداشت‌های تتری انجام شده'
        dataToShow = completedWithdrawalsTetry
        break
      case 'completedTransactions':
        titleToShow = 'معاملات انجام شده'
        dataToShow = completedTransactions
        break
      default:
        break
    }
    setModalTitle(titleToShow)
    setModalData(dataToShow)
    setModalOpen(true)
  }

  // تابع کمکی برای رندر کردن محتویات کارت با توجه به وضعیت بارگذاری و خطا
  const renderCardContent = (title, count, loading, error) => (
    <Card
      sx={{
        cursor: 'pointer',
        textAlign: 'center',
        padding: theme.spacing(2),
        boxShadow: theme.shadows[4],
        borderRadius: theme.shape.borderRadius * 2,
        background: theme.palette.background.paper,
      }}
      onClick={() =>
        handleCardClick(
          title === 'برداشت ریالی درحال برسی'
            ? 'withdrawalsUnderReviewRial'
            : title === 'برداشت تتری درحال برسی'
            ? 'withdrawalsUnderReviewTetry'
            : title === 'معاملات در حال برسی'
            ? 'transactionsUnderReview'
            : title === 'برداشت‌های ریالی انجام شده'
            ? 'completedWithdrawalsRial'
            : title === 'برداشت‌های تتری انجام شده'
            ? 'completedWithdrawalsTetry'
            : title === 'معاملات انجام شده'
            ? 'completedTransactions'
            : '',
        )
      }
    >
      <CardContent>
        <Typography variant='subtitle2'>{title}</Typography>
        {loading ? (
          <CircularProgress size={24} />
        ) : error ? (
          <Typography variant='body2' color='error'>
            {error}
          </Typography>
        ) : (
          <Typography variant='h6'>{count}</Typography>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Box p={theme.spacing(2)}>
      <Typography variant='h4' gutterBottom align='center'>
        اطلاعات روزانه (امروز)
      </Typography>
      <Typography variant='body2' align='center' color='textSecondary' mb={2}>
        تمامی اطلاعات در این بخش مربوط به امروز می‌باشد.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          {renderCardContent(
            'برداشت ریالی درحال برسی',
            withdrawalsUnderReviewRial.length,
            withdrawalsRialLoading,
            withdrawalsRialError,
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderCardContent(
            'برداشت تتری درحال برسی',
            withdrawalsUnderReviewTetry.length,
            withdrawalsTetryLoading,
            withdrawalsTetryError,
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderCardContent(
            'معاملات در حال برسی',
            transactionsUnderReview.length,
            transactionsLoading,
            transactionsError,
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderCardContent(
            'برداشت‌های ریالی انجام شده',
            completedWithdrawalsRial.length,
            withdrawalsRialLoading,
            withdrawalsRialError,
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderCardContent(
            'برداشت‌های تتری انجام شده',
            completedWithdrawalsTetry.length,
            withdrawalsTetryLoading,
            withdrawalsTetryError,
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderCardContent(
            'معاملات انجام شده',
            completedTransactions.length,
            transactionsLoading,
            transactionsError,
          )}
        </Grid>
      </Grid>

      {/* نمایش مودال جزئیات */}
      <DetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        data={modalData}
      />
    </Box>
  )
}

export default CartModalPage
