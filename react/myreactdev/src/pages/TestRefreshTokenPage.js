import React, { useEffect, useState } from 'react'
import { Button, Alert, Box, Typography, CircularProgress } from '@mui/material'
import { tokenManager } from 'utils/tokenManager'
import PersianDateTime from 'utils/PersianDateTime'
import moment from 'moment-timezone'
const TestRefreshTokenPage = () => {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tokenDetails, setTokenDetails] = useState({})
  const [refreshSuccess, setRefreshSuccess] = useState(false)
  const [timeToRefresh, setTimeToRefresh] = useState(null)
  const [timerRunning, setTimerRunning] = useState(false)

  const formatExpiryTime = expiry => {
    if (!expiry) return 'نامشخص'
    const expiryDate = new Date(expiry)
    return expiryDate.toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })
  }
  const [currentIranTime, setCurrentIranTime] = useState(PersianDateTime.now())
  useEffect(() => {
    const intervalId = setInterval(() => {
      // به‌دست آوردن زمان فعلی ایران با استفاده از PersianDateTime.now()
      setCurrentIranTime(PersianDateTime.now())
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  const loadTokenDetails = () => {
    const accessToken = tokenManager.getAccessToken()
    const refreshToken = tokenManager.getRefreshToken()
    const accessExpiry = tokenManager.getTokenExpiry('access_token')
    const refreshExpiry = tokenManager.getTokenExpiry('refresh_token')

    setTokenDetails({
      accessToken,
      refreshToken,
      accessExpiry: formatExpiryTime(accessExpiry),
      refreshExpiry: formatExpiryTime(refreshExpiry),
    })

    if (accessExpiry) {
      setTimeToRefresh(
        Math.max(0, accessExpiry - moment().tz('Asia/Tehran').valueOf()),
      )
    }
  }

  const checkTokenValidity = () => {
    try {
      setMessage('')
      const accessToken = tokenManager.getAccessToken()

      if (!accessToken) {
        setMessage('توکن دسترسی وجود ندارد.')
        return
      }

      const isValid = tokenManager.isTokenValid(accessToken)
      const isNearExpiry = tokenManager.isTokenNearExpiry()

      if (isValid) {
        setMessage(
          `توکن معتبر است. ${
            isNearExpiry ? 'نزدیک به انقضا است.' : 'در وضعیت سالم است.'
          }`,
        )
      } else {
        setMessage('توکن منقضی شده است.')
      }
    } catch (error) {
      console.error('خطا در بررسی توکن:', error)
      setMessage('خطا در بررسی توکن: ' + error.message)
    }
  }

  const handleTokenRefresh = async () => {
    setIsLoading(true)
    setMessage('')
    setRefreshSuccess(false)

    try {
      console.log('درخواست تمدید توکن...')

      const newAccessToken = await tokenManager.refreshAccessToken()
      loadTokenDetails()
      setRefreshSuccess(true)
      setMessage('توکن با موفقیت تمدید شد.')
    } catch (error) {
      console.error('خطا در تمدید توکن:', error)
      setMessage('خطا در تمدید توکن: ' + (error.message || 'مشکل ناشناخته'))
    } finally {
      setIsLoading(false)
    }
  }

  const clearAllTokens = () => {
    tokenManager.clearTokens()
    setTokenDetails({})
    setMessage('همه توکن‌ها پاک شدند.')
    setTimeToRefresh(null)
    setTimerRunning(false)
  }

  const startAutoRefreshTimer = () => {
    setTimerRunning(true)

    const timer = setInterval(() => {
      const accessExpiry = tokenManager.getTokenExpiry('access_token')

      if (accessExpiry) {
        const timeRemaining =
          accessExpiry - moment().tz('Asia/Tehran').valueOf()
        setTimeToRefresh(Math.max(0, timeRemaining))

        if (timeRemaining < 60 * 1000) {
          console.log('توکن نزدیک به انقضا است. تمدید...')
          handleTokenRefresh()
        }
      } else {
        clearInterval(timer)
        setTimerRunning(false)
      }
    }, 1000)

    return () => clearInterval(timer)
  }

  useEffect(() => {
    loadTokenDetails()
    if (timerRunning) {
      startAutoRefreshTimer()
    }

    return () => {
      setTimerRunning(false)
    }
  }, [timerRunning])

  return (
    <Box
      display='flex'
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
      minHeight='100vh'
    >
      <Typography variant='h4' gutterBottom>
        تست مدیریت توکن
      </Typography>

      {message && (
        <Alert
          severity={message.includes('خطا') ? 'error' : 'info'}
          sx={{ mt: 2 }}
        >
          {message}
        </Alert>
      )}

      <Box mt={2}>
        <Typography variant='h6'>جزئیات توکن:</Typography>
        <Typography variant='body2'>
          Access Token: {tokenDetails.accessToken || 'ندارد'}
        </Typography>
        <Typography variant='body2'>
          Refresh Token: {tokenDetails.refreshToken || 'ندارد'}
        </Typography>
        <Typography variant='body2'>
          زمان انقضای Access Token: {tokenDetails.accessExpiry || 'نامشخص'}
        </Typography>
        <Typography variant='body2'>
          زمان انقضای Refresh Token: {tokenDetails.refreshExpiry || 'نامشخص'}
        </Typography>
        {timeToRefresh !== null && (
          <Typography variant='body2' color='primary'>
            زمان باقی‌مانده تا تمدید: {Math.ceil(timeToRefresh / 1000)} ثانیه
          </Typography>
        )}
      </Box>

      <Box mt={2}>
        <Button
          variant='contained'
          color='primary'
          onClick={checkTokenValidity}
          disabled={isLoading}
        >
          بررسی اعتبار توکن
        </Button>
      </Box>

      <Box mt={2}>
        <Button
          variant='contained'
          color='secondary'
          onClick={handleTokenRefresh}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'تمدید توکن'}
        </Button>
      </Box>

      <Box mt={2}>
        <Button
          variant='contained'
          color='success'
          onClick={startAutoRefreshTimer}
          disabled={timerRunning}
        >
          شروع تایمر تمدید
        </Button>
        <Button
          variant='contained'
          color='warning'
          onClick={() => setTimerRunning(false)}
          sx={{ ml: 2 }}
        >
          توقف تایمر تمدید
        </Button>
      </Box>

      <Box mt={2}>
        <Button variant='outlined' color='error' onClick={clearAllTokens}>
          پاک کردن همه توکن‌ها
        </Button>
      </Box>
    </Box>
  )
}

export default TestRefreshTokenPage
