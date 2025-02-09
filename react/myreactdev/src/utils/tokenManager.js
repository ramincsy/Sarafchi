import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import { getOrCreateUUID } from 'utils/uuidManager'
import PersianDateTime from 'utils/PersianDateTime'
import moment from 'moment-timezone'

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  ACCESS_TOKEN_EXPIRY: 'access_token_expiry',
  REFRESH_TOKEN_EXPIRY: 'refresh_token_expiry',
}

const TOKEN_EXPIRY_THRESHOLD = 1 * 60 * 1000 // کمتر از 1 دقیقه
let isRefreshing = false
let refreshSubscribers = []

const onRefreshed = newToken => {
  refreshSubscribers.forEach(callback => callback(newToken))
  refreshSubscribers = []
}

const onRefreshFailed = () => {
  refreshSubscribers.forEach(callback => callback(null))
  refreshSubscribers = []
}

const setToken = (key, value) => {
  if (value) {
    localStorage.setItem(key, value)
  }
}

const getToken = key => {
  const token = localStorage.getItem(key)

  return token
}

const setTokens = ({
  access_token,
  refresh_token,
  access_token_expiry,
  refresh_token_expiry,
}) => {
  if (access_token) setToken(TOKEN_KEYS.ACCESS_TOKEN, access_token)
  if (refresh_token) setToken(TOKEN_KEYS.REFRESH_TOKEN, refresh_token)

  if (access_token_expiry) {
    const expiryDate =
      typeof access_token_expiry === 'number'
        ? new Date(access_token_expiry * 1000).toISOString()
        : new Date(access_token_expiry).toISOString()
    setToken(TOKEN_KEYS.ACCESS_TOKEN_EXPIRY, expiryDate)
  }

  if (refresh_token_expiry) {
    const expiryDate =
      typeof refresh_token_expiry === 'number'
        ? new Date(refresh_token_expiry * 1000).toISOString()
        : new Date(refresh_token_expiry).toISOString()
    setToken(TOKEN_KEYS.REFRESH_TOKEN_EXPIRY, expiryDate)
  }
}

const clearTokens = () => {
  Object.values(TOKEN_KEYS).forEach(key => localStorage.removeItem(key))
  console.log('All tokens cleared.')
}

const isTokenValid = token => {
  if (!token) return false

  try {
    const decoded = jwtDecode(token)
    const expiryTime = decoded.exp * 1000 // تبدیل ثانیه به میلی‌ثانیه
    // return expiryTime > Date.now();
    return (
      moment(expiryTime).tz('Asia/Tehran').valueOf() >
      moment(PersianDateTime.now(), 'YYYY-MM-DD HH:mm:ss')
        .tz('Asia/Tehran')
        .valueOf()
    )
  } catch (error) {
    console.error('Error decoding token:', error)
    return false
  }
}

const isTokenNearExpiry = () => {
  const expiry = getToken(TOKEN_KEYS.ACCESS_TOKEN_EXPIRY)
  if (!expiry) return true
  const expiryDate = new Date(expiry).getTime()
  return (
    expiryDate - moment().tz('Asia/Tehran').valueOf() < TOKEN_EXPIRY_THRESHOLD
  )
}

const refreshAccessToken = async () => {
  if (isRefreshing) {
    console.warn('Token refresh already in progress.')
    return new Promise((resolve, reject) => {
      refreshSubscribers.push(newToken => {
        if (newToken) resolve(newToken)
        else reject(new Error('Token refresh failed.'))
      })
    })
  }

  isRefreshing = true

  try {
    const response = await axios.post('http://127.0.0.1:5000/api/refresh', {
      refresh_token: getToken(TOKEN_KEYS.REFRESH_TOKEN),
      device_id: getOrCreateUUID(),
    })

    const {
      access_token,
      refresh_token: newRefreshToken,
      access_token_expiry,
      refresh_token_expiry,
    } = response.data

    setTokens({
      access_token,
      refresh_token: newRefreshToken,
      access_token_expiry,
      refresh_token_expiry,
    })

    onRefreshed(access_token)
    return access_token
  } catch (error) {
    console.error('Error refreshing token:', error)
    onRefreshFailed()
    clearTokens()
    throw error
  } finally {
    isRefreshing = false
  }
}

const getRefreshToken = () => {
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN)
}
const getTokenExpiry = key => {
  const expiry = getToken(key)
  if (!expiry) return null
  return new Date(expiry).getTime() // بازگرداندن زمان انقضا به میلی‌ثانیه
}
const logout = () => {
  clearTokens()
  window.location.href = '/login' // هدایت کاربر به صفحه ورود
}

const validateAndRefreshToken = async () => {
  const accessToken = getToken(TOKEN_KEYS.ACCESS_TOKEN)

  if (!accessToken) {
    console.error('Access token is missing.')
    clearTokens()
    throw new Error('Access token not found.')
  }

  // بررسی اعتبار توکن و جلوگیری از تمدید غیرضروری
  if (isTokenValid(accessToken)) {
    if (!isTokenNearExpiry()) {
      console.log(
        'Token is valid and has sufficient time remaining. No refresh needed.',
      )
      return accessToken // توکن معتبر و با زمان کافی
    }
  } else {
    console.warn('Access token is expired or invalid. Refresh required.')
  }

  // فرآیند تمدید توکن
  try {
    return await refreshAccessToken()
  } catch (error) {
    console.error('Token refresh failed:', error)
    clearTokens()
    throw error
  }
}

export const tokenManager = {
  getAccessToken: () => getToken(TOKEN_KEYS.ACCESS_TOKEN),
  setTokens,
  clearTokens,
  getRefreshToken,
  isTokenValid,
  getTokenExpiry,
  isTokenNearExpiry,
  refreshAccessToken,
  validateAndRefreshToken,
  logout,
}
