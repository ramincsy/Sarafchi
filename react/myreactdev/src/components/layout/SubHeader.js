import React, { useState, useEffect, useContext } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Grid,
  Paper,
} from '@mui/material'
import AuthContext from 'contexts/AuthContext'
import ApiManager from 'services/ApiManager'
import { AccountBalanceWallet, AttachMoney, Money } from '@mui/icons-material'
import useUSDTPrice from 'hooks/useUSDTPrice' // فراخوانی هوک

const SubHeader = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { userInfo } = useContext(AuthContext)
  const userID = userInfo?.UserID

  // استفاده از هوک برای دریافت قیمت دلار
  const {
    price: usdPrice,
    loading: priceLoading,
    error: priceError,
  } = useUSDTPrice('sell')

  // مدیریت موجودی‌ها
  const [balances, setBalances] = useState({ USDT: 0, IRR: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userID) {
      fetchBalances(userID)
    } else {
      setError('شناسه کاربر یافت نشد.')
      setIsLoading(false)
    }
  }, [userID])

  const fetchBalances = async uid => {
    try {
      setIsLoading(true)
      const data = await ApiManager.BalancesService.fetchBalances(uid)
      if (data.success && Array.isArray(data.balances)) {
        setBalances({
          USDT: getNetBalance(data.balances, 'USDT'),
          IRR: getNetBalance(data.balances, 'IRR'),
        })
      } else {
        setError('خطا در دریافت موجودی‌ها.')
      }
    } catch (err) {
      console.error('خطا در دریافت موجودی‌ها:', err)
      setError('ارتباط با سرور با مشکل مواجه شد.')
    } finally {
      setIsLoading(false)
    }
  }

  const getNetBalance = (balancesArray, currencyType) => {
    return (
      balancesArray.find(item => item.CurrencyType === currencyType)
        ?.NetBalance || 0
    )
  }

  const formatNumber = value => {
    return value.toLocaleString('fa-IR')
  }

  const renderCard = (title, value, suffix, IconComponent, gradient) => (
    <Card
      variant='outlined'
      sx={{
        width: isMobile ? 140 : 180,
        height: isMobile ? 60 : 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 0,
        py: 0,
        borderRadius: 3,
        background: gradient,
        boxShadow: theme.shadows[3],
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          p: '8px !important',
        }}
      >
        {!isMobile && IconComponent}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant='caption'
            sx={{ color: theme.palette.common.white }}
          >
            {title}
          </Typography>
          <Typography
            variant='body1'
            sx={{ color: theme.palette.common.white, fontWeight: 'bold' }}
          >
            {formatNumber(value)} {suffix}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )

  const cardsData = [
    {
      title: 'موجودی تتر',
      value: balances.USDT,
      suffix: 'USDT',
      icon: <AccountBalanceWallet sx={{ color: 'white' }} />,
      gradient: 'linear-gradient(135deg, #373b44, #4286f4)',
    },
    {
      title: 'قیمت دلار',
      value: usdPrice,
      suffix: 'تومان',
      icon: <AttachMoney sx={{ color: 'white' }} />,
      gradient: 'linear-gradient(135deg,#5a3f37, #2c7744)',
    },
    {
      title: 'موجودی ریالی',
      value: balances.IRR,
      suffix: 'IRR',
      icon: <Money sx={{ color: 'white' }} />,
      gradient: 'linear-gradient(135deg, #373b44, #4286f4)',
    },
  ]

  // مدیریت خطاهای کلی
  const hasError = error || priceError

  // نمایش لوادینگ اگر هر دو بخش در حال بارگذاری باشند
  const isLoadingOverall = isLoading || priceLoading

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        minHeight: isMobile ? 70 : 90,
        borderBottom: `1px solid ${theme.palette.divider}`,
        background:
          'linear-gradient(50deg, rgba(238, 242, 243, 0.8), rgba(238, 242, 243, 0.8))',
        backdropFilter: 'blur(10px)', // ایجاد افکت شیشهای
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 0.5,
        py: 0,
        overflowX: 'hidden', // جلوگیری از اسکرول افقی
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // افزودن سایه برای جذابیت بیشتر
        borderRadius: '8px', // گرد کردن گوشه‌ها
      }}
    >
      {isLoadingOverall ? (
        <Box sx={{ margin: 'auto' }}>
          <CircularProgress size={24} sx={{ color: 'white' }} />
        </Box>
      ) : hasError ? (
        <Typography color='error' sx={{ margin: 'auto' }}>
          {error || priceError || 'خطا در بارگذاری اطلاعات'}
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? 1 : 2,
            width: '100%',
            flexWrap: 'nowrap',
            overflowX: isMobile ? 'auto' : 'hidden',
          }}
        >
          {cardsData.map((card, index) => (
            <div key={index}>
              {renderCard(
                card.title,
                card.value,
                card.suffix,
                card.icon,
                card.gradient,
              )}
            </div>
          ))}
        </Box>
      )}
    </Paper>
  )
}

export default SubHeader
