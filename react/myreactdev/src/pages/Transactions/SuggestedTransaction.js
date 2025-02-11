import React, { useState, useContext } from 'react'
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
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AuthContext from 'contexts/AuthContext'
import TransactionsService from 'services/TransactionService'
import AdvancedTable from 'components/tables/AdvancedTable'

const SuggestedTransaction = () => {
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [total, setTotal] = useState(null)
  const [currency, setCurrency] = useState('USD')
  const [transactionType, setTransactionType] = useState('buy')
  const [refreshKey, setRefreshKey] = useState(0)
  const theme = useTheme()
  const { userInfo } = useContext(AuthContext)
  const getCurrentUserID = userInfo?.user_id || 'System'

  const fetchData = async () => {
    try {
      const data = await TransactionsService.fetchTransactions()
      return data.map((transaction, index) => ({
        WithdrawalID: transaction.TransactionID || index,
        UserID: transaction.UserID,
        Amount: transaction.Quantity,
        Currency: transaction.CurrencyType,
        Price: transaction.Price,
        Total: transaction.Quantity * transaction.Price,
        Date: new Date(transaction.TransactionDateTime).toLocaleString('fa-IR'),
        Status: transaction.Status || 'Processing',
      }))
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  }

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

  const handleQuantityChange = e => {
    const value = e.target.value
    setQuantity(value)
    setTotal(price && value ? value * price : null)
  }

  const handlePriceChange = e => {
    const value = e.target.value
    setPrice(value)
    setTotal(quantity && value ? quantity * value : null)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const transactionData = {
      UserID: userInfo?.user_id || 1,
      Quantity: parseFloat(quantity),
      Price: parseFloat(price),
      TransactionType: 'Suggested',
      Position: transactionType === 'buy' ? 'Buy' : 'Sell',
      CurrencyType: currency,
      CreatedBy: getCurrentUserID,
    }

    try {
      await TransactionsService.createTransaction(transactionData)
      alert('تراکنش با موفقیت ثبت شد')
      setQuantity('')
      setPrice('')
      setTotal(null)
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      alert('خطا در ثبت تراکنش')
    }
  }

  return (
    <Grid container spacing={3} padding={3}>
      <Grid item xs={12} md={4}>
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            backgroundColor: theme.palette.background.paper,
            height: '100%',
          }}
        >
          <Typography
            variant='h5'
            gutterBottom
            color={theme.palette.text.primary}
          >
            ثبت معامله جدید
          </Typography>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin='normal'>
              <InputLabel>نوع معامله</InputLabel>
              <Select
                value={transactionType}
                onChange={e => setTransactionType(e.target.value)}
              >
                <MenuItem value='buy'>خرید</MenuItem>
                <MenuItem value='sell'>فروش</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin='normal'>
              <InputLabel>نوع ارز</InputLabel>
              <Select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                <MenuItem value='USD'>دلار</MenuItem>
                <MenuItem value='USDT'>تتر</MenuItem>
                <MenuItem value='CNY'>یوان</MenuItem>
                <MenuItem value='TRY'>لیر</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label='تعداد'
              type='number'
              fullWidth
              margin='normal'
              value={quantity}
              onChange={handleQuantityChange}
            />

            <TextField
              label='قیمت پیشنهادی'
              type='number'
              fullWidth
              margin='normal'
              value={price}
              onChange={handlePriceChange}
            />

            <TextField
              label='مجموع'
              fullWidth
              margin='normal'
              value={total || 'در حال محاسبه...'}
              InputProps={{ readOnly: true }}
            />

            <Button
              type='submit'
              variant='contained'
              color='primary'
              fullWidth
              sx={{ mt: 2 }}
            >
              ثبت معامله
            </Button>
          </form>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Accordion defaultExpanded sx={{ height: 'auto' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant='h6'>تاریخچه معاملات</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ overflowY: 'auto', maxHeight: '70vh' }}>
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

export default SuggestedTransaction
