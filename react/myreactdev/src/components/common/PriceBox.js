import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material'
import useUSDTPrice from 'hooks/useUSDTPrice' // فراخوانی هوک

const PriceBox = ({
  refreshInterval = 10000, // تغییر به 10 ثانیه
  showBuyPrice = true,
  showSellPrice = true,
  splitBoxes = true,
}) => {
  const theme = useTheme()

  // استفاده از هوک برای دریافت قیمت خرید و فروش
  const {
    price: buyPrice,
    loading: buyLoading,
    error: buyError,
  } = useUSDTPrice('buy')
  const {
    price: sellPrice,
    loading: sellLoading,
    error: sellError,
  } = useUSDTPrice('sell')

  // مدیریت خطاهای کلی
  const hasError = buyError || sellError

  // نمایش لوادینگ اگر هر دو قیمت در حال بارگذاری باشند
  const isLoading = buyLoading || sellLoading

  // رندر کارت‌ها
  const renderCard = (title, value, color) => (
    <Card
      sx={{
        flex: 1,
        padding: 2,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[4],
        backgroundColor: theme.palette.background.paper,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography
          variant='h6'
          gutterBottom
          sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}
        >
          {title}
        </Typography>
        <Typography variant='h4' sx={{ color: color, fontWeight: 'bold' }}>
          {value?.toLocaleString()} تومان
        </Typography>
      </CardContent>
    </Card>
  )

  // نمایش لوادینگ
  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        padding={2}
      >
        <CircularProgress color='primary' />
      </Box>
    )
  }

  // نمایش خطا
  if (hasError) {
    return (
      <Card
        sx={{
          padding: 2,
          margin: 1,
          textAlign: 'center',
          backgroundColor: theme.palette.error.light,
        }}
      >
        <Typography color='error' variant='h6'>
          {buyError || sellError || 'خطا در دریافت قیمت'}
        </Typography>
      </Card>
    )
  }

  // نمایش کارت‌ها
  return (
    <Box display={splitBoxes ? 'flex' : 'block'} gap={2}>
      {showSellPrice &&
        renderCard('قیمت فروش', sellPrice, theme.palette.error.main)}
      {showBuyPrice &&
        renderCard('قیمت خرید', buyPrice, theme.palette.success.main)}
    </Box>
  )
}

PriceBox.propTypes = {
  refreshInterval: PropTypes.number,
  showBuyPrice: PropTypes.bool,
  showSellPrice: PropTypes.bool,
  splitBoxes: PropTypes.bool,
}

export default PriceBox
