import React, { useState, useMemo, useContext } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Button,
  Typography,
  useTheme,
} from '@mui/material'
import WithdrawalsUSDTService from 'services/WithdrawalsUSDTService'
import AuthContext from 'contexts/AuthContext'
import { getUserID } from 'utils/userUtils'
import AdvancedTable from 'components/tables/AdvancedTable'

const WithdrawUSDTPage = () => {
  const [amount, setAmount] = useState('')
  const [destinationAddress, setDestinationAddress] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0) // برای رفرش کردن AdvancedTable
  const theme = useTheme()
  const { userInfo } = useContext(AuthContext)
  const user_id = getUserID(userInfo)
  console.log('User ID:', user_id)

  // تابع واکشی برداشت‌ها برای AdvancedTable
  const fetchData = async () => {
    try {
      const res = await WithdrawalsUSDTService.fetchAllWithdrawals()
      if (res.success) {
        return res.data.map((withdrawal, index) => ({
          WithdrawalID: withdrawal.WithdrawalID || index,
          Amount: withdrawal.Amount,
          DestinationAddress: withdrawal.DestinationAddress,
          Status: withdrawal.Status,
          // تبدیل تاریخ به فرمت فارسی
          Date: new Date(withdrawal.CreatedAt).toLocaleString('fa-IR'),
        }))
      } else {
        setError(res.error || 'خطا در دریافت تاریخچه برداشت.')
        return []
      }
    } catch (err) {
      console.error('Error fetching withdrawals:', err)
      setError('خطا در دریافت تاریخچه برداشت.')
      return []
    }
  }

  // تابع ارسال درخواست برداشت
  const handleWithdraw = async () => {
    if (!amount || !destinationAddress) {
      setError('لطفاً تمام فیلدها را پر کنید.')
      return
    }
    const payload = {
      UserID: user_id,
      Amount: parseFloat(amount),
      DestinationAddress: destinationAddress,
    }
    try {
      const response = await WithdrawalsUSDTService.createWithdrawal(payload)
      if (response.success) {
        setSuccess('درخواست برداشت با موفقیت ثبت شد.')
        setError(null)
        setAmount('')
        setDestinationAddress('')
        setRefreshKey(prev => prev + 1)
      } else {
        setError(response.error || 'خطا در ثبت درخواست برداشت.')
        setSuccess(null)
      }
    } catch (err) {
      console.error('Error during withdrawal request:', err)
      setError('خطا در ثبت درخواست برداشت.')
      setSuccess(null)
    }
  }

  // تعریف ستون‌های AdvancedTable به صورت useMemo (برای جلوگیری از رندر مجدد غیر ضروری)
  const columns = useMemo(
    () => [
      { field: 'WithdrawalID', label: 'شناسه' },
      { field: 'Amount', label: 'مقدار' },
      { field: 'DestinationAddress', label: 'آدرس مقصد' },
      { field: 'Status', label: 'وضعیت' },
      { field: 'Date', label: 'تاریخ' },
    ],
    [],
  )

  // تابع تعیین رنگ پس‌زمینه ردیف‌ها بر اساس وضعیت برداشت
  const getRowBgColor = status => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return '#d0f0c0' // سبز روشن
      case 'Rejected':
      case 'Canceled':
        return '#f0d0d0' // قرمز روشن
      case 'Pending':
      case 'Processing':
        return '#fffacd' // زرد ملایم
      default:
        return '#ffffff' // سفید
    }
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: theme.palette.background.default }}>
      <Typography variant='h4' textAlign='center' mb={4}>
        درخواست برداشت USDT
      </Typography>
      <Grid container spacing={4}>
        {/* فرم درخواست برداشت */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title='فرم درخواست برداشت'
              sx={{ textAlign: 'center', fontWeight: 'bold' }}
            />
            <CardContent>
              <Box display='flex' flexDirection='column' gap={3}>
                <TextField
                  label='آدرس مقصد'
                  value={destinationAddress}
                  onChange={e => setDestinationAddress(e.target.value)}
                  fullWidth
                />
                <TextField
                  label='مقدار USDT'
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  type='number'
                  fullWidth
                />
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleWithdraw}
                  fullWidth
                >
                  ثبت درخواست
                </Button>
                {error && (
                  <Typography color='error' textAlign='center'>
                    {error}
                  </Typography>
                )}
                {success && (
                  <Typography sx={{ color: 'green', textAlign: 'center' }}>
                    {success}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* تاریخچه برداشت‌ها با استفاده از AdvancedTable */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title='تاریخچه برداشت‌ها'
              sx={{ textAlign: 'center', fontWeight: 'bold' }}
            />
            <CardContent>
              <AdvancedTable
                key={refreshKey} // تغییر key باعث re-mount و واکشی مجدد داده‌ها می‌شود
                columns={columns}
                fetchData={fetchData}
                defaultPageSize={10}
                getCardBgColor={getRowBgColor}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default WithdrawUSDTPage
