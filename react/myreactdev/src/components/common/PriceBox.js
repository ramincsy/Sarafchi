import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material'
import ApiManager from 'services/ApiManager'

const PriceBox = ({
  refreshInterval = 100000,
  showBuyPrice = true,
  showSellPrice = true,
  splitBoxes = true,
}) => {
  const theme = useTheme()
  const [loadingPrice, setLoadingPrice] = useState(true)
  const [priceError, setPriceError] = useState(null)
  const [livePrice, setLivePrice] = useState(null)
  const [buyPrice, setBuyPrice] = useState(null)

  const fetchPrice = async () => {
    setLoadingPrice(true)
    try {
      const data = await ApiManager.PriceService.fetchPrice()
      if (data.success) {
        const sellPrice = data.price
        const calculatedBuyPrice = sellPrice - 950
        setLivePrice(sellPrice)
        setBuyPrice(calculatedBuyPrice)
        setPriceError(null)
      } else {
        setPriceError('خطا در دریافت قیمت')
      }
    } catch (error) {
      setPriceError('خطای شبکه یا سرور')
    } finally {
      setLoadingPrice(false)
    }
  }

  useEffect(() => {
    fetchPrice()
    const interval = setInterval(fetchPrice, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const renderCard = (title, value, color, bgColor) => (
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

  if (loadingPrice) {
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

  if (priceError) {
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
          {priceError}
        </Typography>
      </Card>
    )
  }

  return (
    <Box display={splitBoxes ? 'flex' : 'block'} gap={2}>
      {showSellPrice &&
        renderCard(
          'قیمت فروش',
          livePrice,
          theme.palette.error.main,
          theme.palette.background.default,
        )}
      {showBuyPrice &&
        renderCard(
          'قیمت خرید',
          buyPrice,
          theme.palette.success.main,
          theme.palette.background.default,
        )}
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
