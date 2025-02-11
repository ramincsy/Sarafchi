// FinancialDashboard.jsx
import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Box,
  Divider,
  Paper,
} from '@mui/material'
import { ArrowDropUp, ArrowDropDown, Remove } from '@mui/icons-material'

import FinancialDashboardService from 'services/FinancialDashboardService'
import AdvancedTable from 'components/tables/AdvancedTable'

const FinancialDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)

  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  useEffect(() => {
    fetchData()
    fetchLogs()
    fetchTransactions()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await FinancialDashboardService.fetchOverview()
      setData(response)
    } catch (error) {
      console.error('خطا در دریافت اطلاعات کلی:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    setLogsLoading(true)
    try {
      const response = await FinancialDashboardService.fetchBalanceLogs()
      setLogs(response)
    } catch (error) {
      console.error('خطا در دریافت لاگ‌ها:', error)
    } finally {
      setLogsLoading(false)
    }
  }

  const fetchTransactions = async () => {
    setTransactionsLoading(true)
    try {
      const response = await FinancialDashboardService.fetchTransactions()
      setTransactions(response)
    } catch (error) {
      console.error('خطا در دریافت تراکنش‌ها:', error)
    } finally {
      setTransactionsLoading(false)
    }
  }

  const formatCurrency = (value, currency) => {
    try {
      if (currency && typeof currency === 'string' && currency.length === 3) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
        }).format(value)
      } else {
        return `${Number(value).toLocaleString('en-US')} ${currency || ''}`
      }
    } catch (error) {
      console.error('خطا در فرمت ارز:', error)
      return `${value} ${currency || ''}`
    }
  }

  // جمع موجودی کاربران
  const getTotalUserBalance = () => {
    if (!data || !data.userBalances) return 0
    return data.userBalances.reduce((acc, row) => acc + row.totalBalance, 0)
  }

  // جمع موجودی صرافی
  const getTotalExchangeBalance = () => {
    if (!data || !data.exchangeBalances) return 0
    return data.exchangeBalances.reduce((acc, row) => acc + row.totalBalance, 0)
  }

  // ستون‌های لاگ/تراکنش
  const logsColumns = [
    { field: 'LogID', label: 'شناسه لاگ' },
    { field: 'UserID', label: 'شناسه کاربر' },
    { field: 'ActionType', label: 'نوع عملیات' },
    { field: 'OldDebit', label: 'موجودی قدیمی' },
    { field: 'NewDebit', label: 'موجودی جدید' },
    { field: 'ActionDateTime', label: 'تاریخ عملیات' },
  ]

  const transactionsColumns = [
    { field: 'TransactionID', label: 'شناسه تراکنش' },
    { field: 'UserID', label: 'شناسه کاربر' },
    { field: 'Quantity', label: 'تعداد' },
    { field: 'Price', label: 'قیمت' },
    { field: 'TransactionType', label: 'نوع' },
    { field: 'TransactionDateTime', label: 'تاریخ' },
  ]

  // تابع fetch برای لاگ‌ها
  const fetchLogsData = async () => {
    if (logsLoading || !logs) return []
    return logs.map(log => ({
      LogID: log.LogID,
      UserID: log.UserID,
      ActionType: log.ActionType,
      OldDebit: log.OldDebit,
      NewDebit: log.NewDebit,
      ActionDateTime: log.ActionDateTime,
    }))
  }

  // تابع fetch برای تراکنش‌ها
  const fetchTransactionsData = async () => {
    if (transactionsLoading || !transactions) return []
    return transactions.map(t => ({
      TransactionID: t.TransactionID,
      UserID: t.UserID,
      Quantity: t.Quantity,
      Price: t.Price,
      TransactionType: t.TransactionType,
      TransactionDateTime: t.TransactionDateTime,
    }))
  }

  // نمایش کارت‌های KPI (مجموع موجودی کاربران و صرافی)
  const renderKPICards = () => {
    const totalUserBalance = getTotalUserBalance()
    const totalExchangeBalance = getTotalExchangeBalance()

    return (
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* KPI: مجموع موجودی کاربران */}
        <Grid item xs={12} sm={6} md={3}>
          <Card variant='outlined' sx={{ p: 2 }}>
            <Typography variant='subtitle1' color='text.secondary'>
              مجموع موجودی کاربران
            </Typography>
            <Typography variant='h6'>
              {formatCurrency(totalUserBalance, 'USD')}
            </Typography>
          </Card>
        </Grid>

        {/* KPI: مجموع موجودی صرافی */}
        <Grid item xs={12} sm={6} md={3}>
          <Card variant='outlined' sx={{ p: 2 }}>
            <Typography variant='subtitle1' color='text.secondary'>
              مجموع موجودی صرافی
            </Typography>
            <Typography variant='h6'>
              {formatCurrency(totalExchangeBalance, 'USD')}
            </Typography>
          </Card>
        </Grid>
      </Grid>
    )
  }

  // کارت‌های اختلاف حساب
  const renderDiscrepancyCards = () => {
    if (!data || !data.discrepancies) return null

    return (
      <Grid container spacing={2}>
        {data.discrepancies.map((row, idx) => {
          let icon = <Remove sx={{ color: 'grey' }} />
          let diffColor = 'grey'
          if (row.difference > 0) {
            icon = <ArrowDropUp sx={{ color: 'green' }} />
            diffColor = 'green'
          } else if (row.difference < 0) {
            icon = <ArrowDropDown sx={{ color: 'red' }} />
            diffColor = 'red'
          }

          return (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='h6' sx={{ mb: 1 }}>
                    ارز: {row.currencyType}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    موجودی کاربر:{' '}
                    {formatCurrency(row.userBalance, row.currencyType)}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    موجودی صرافی:{' '}
                    {formatCurrency(row.exchangeBalance, row.currencyType)}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {icon}
                    <Typography variant='body1' sx={{ color: diffColor }}>
                      اختلاف: {formatCurrency(row.difference, row.currencyType)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    )
  }

  return (
    <Container>
      <Typography variant='h4' gutterBottom>
        داشبورد نظارت مالی
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* کارت‌های KPI بالای صفحه */}
          {renderKPICards()}

          {/* کارت‌های اختلاف حساب */}
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
            >
              <Typography variant='h6'>وضعیت اختلاف حساب</Typography>
              <Button variant='contained' onClick={fetchData}>
                بروزرسانی
              </Button>
            </Box>
            {renderDiscrepancyCards()}
          </Paper>

          {/* لاگ‌ها */}
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant='h6' gutterBottom>
              لاگ تغییرات موجودی
            </Typography>
            {logsLoading ? (
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <AdvancedTable
                columns={[
                  { field: 'LogID', label: 'شناسه لاگ' },
                  { field: 'UserID', label: 'شناسه کاربر' },
                  { field: 'ActionType', label: 'نوع عملیات' },
                  { field: 'OldDebit', label: 'موجودی قدیمی' },
                  { field: 'NewDebit', label: 'موجودی جدید' },
                  { field: 'ActionDateTime', label: 'تاریخ عملیات' },
                ]}
                fetchData={fetchLogsData}
                defaultPageSize={5}
                showSearchTerm={false}
                showStatusFilter={false}
                showColumnsFilter={false}
                showDownload={false}
              />
            )}
          </Paper>

          {/* تراکنش‌ها */}
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              تراکنش‌های اخیر
            </Typography>
            {transactionsLoading ? (
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <AdvancedTable
                columns={[
                  { field: 'TransactionID', label: 'شناسه تراکنش' },
                  { field: 'UserID', label: 'شناسه کاربر' },
                  { field: 'Quantity', label: 'تعداد' },
                  { field: 'Price', label: 'قیمت' },
                  { field: 'TransactionType', label: 'نوع' },
                  { field: 'TransactionDateTime', label: 'تاریخ' },
                ]}
                fetchData={fetchTransactionsData}
                defaultPageSize={5}
                showSearchTerm={false}
                showStatusFilter={false}
                showColumnsFilter={false}
                showDownload={false}
              />
            )}
          </Paper>
        </Box>
      )}
    </Container>
  )
}

export default FinancialDashboard
