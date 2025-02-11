import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material'
import UserService from 'services/UserService'

// داده‌های نمونه کاربران
const sampleUsers = [
  {
    id: 1,
    name: 'کاربر ۱',
    email: 'user1@example.com',
    isBlocked: false,
    dollarRate: 42000,
    tradeLimitCount: 10,
    tradeLimitAmount: 1000000,
    rialWithdrawLimitCount: 5,
    rialWithdrawLimitAmount: 500000,
    tetherWithdrawLimitCount: 5,
    tetherWithdrawLimitAmount: 500,
    loan: 0,
    rialBalance: 1000000,
    tetherBalance: 100,
  },
  // کاربران دیگر...
]

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await UserService.fetchUsers()
        setUsers(usersData)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleOpen = user => {
    setSelectedUser(user)
    setOpen(true)
  }

  const handleClose = () => {
    setSelectedUser(null)
    setOpen(false)
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setSelectedUser({
      ...selectedUser,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSave = () => {
    // در اینجا باید تغییرات را به سرور ارسال کنید
    const updatedUsers = users.map(user =>
      user.id === selectedUser.id ? selectedUser : user,
    )
    setUsers(updatedUsers)
    handleClose()
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>نام</TableCell>
            <TableCell>ایمیل</TableCell>
            <TableCell>وضعیت</TableCell>
            <TableCell>عملیات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.ID}>
              <TableCell>{`${user.FirstName} ${user.LastName}`}</TableCell>
              <TableCell>{user.Email}</TableCell>
              <TableCell>
                {user.Status === 'Active' ? 'فعال' : 'مسدود'}
              </TableCell>
              <TableCell>
                <Button variant='contained' onClick={() => handleOpen(user)}>
                  مدیریت
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedUser && (
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>مدیریت کاربر</DialogTitle>
          <DialogContent>
            <FormControlLabel
              control={
                <Switch
                  checked={selectedUser.isBlocked}
                  onChange={handleChange}
                  name='isBlocked'
                />
              }
              label='مسدودسازی کاربر'
            />
            <TextField
              margin='dense'
              label='نرخ دلار'
              type='number'
              fullWidth
              name='dollarRate'
              value={selectedUser.dollarRate}
              onChange={handleChange}
            />
            <TextField
              margin='dense'
              label='محدودیت تعداد معاملات'
              type='number'
              fullWidth
              name='tradeLimitCount'
              value={selectedUser.tradeLimitCount}
              onChange={handleChange}
            />
            <TextField
              margin='dense'
              label='محدودیت مقدار معاملات'
              type='number'
              fullWidth
              name='tradeLimitAmount'
              value={selectedUser.tradeLimitAmount}
              onChange={handleChange}
            />
            <TextField
              margin='dense'
              label='محدودیت تعداد برداشت‌های ریالی'
              type='number'
              fullWidth
              name='rialWithdrawLimitCount'
              value={selectedUser.rialWithdrawLimitCount}
              onChange={handleChange}
            />
            <TextField
              margin='dense'
              label='محدودیت مقدار برداشت‌های ریالی'
              type='number'
              fullWidth
              name='rialWithdrawLimitAmount'
              value={selectedUser.rialWithdrawLimitAmount}
              onChange={handleChange}
            />
            <TextField
              margin='dense'
              label='محدودیت تعداد برداشت‌های تتری'
              type='number'
              fullWidth
              name='tetherWithdrawLimitCount'
              value={selectedUser.tetherWithdrawLimitCount}
              onChange={handleChange}
            />
            <TextField
              margin='dense'
              label='محدودیت مقدار برداشت‌های تتری'
              type='number'
              fullWidth
              name='tetherWithdrawLimitAmount'
              onChange={handleChange}
            />
            <TextField
              margin='dense'
              label='تخصیص وام'
              type='number'
              fullWidth
              name='loan'
              value={selectedUser.loan}
              onChange={handleChange}
            />
            <TextField
              margin='dense'
              label='شارژ حساب ریالی'
              type='number'
              fullWidth
              name='rialBalance'
              value={selectedUser.rialBalance}
              onChange={handleChange}
            />
            <TextField
              margin='dense'
              label='شارژ حساب تتری'
              type='number'
              fullWidth
              name='tetherBalance'
              value={selectedUser.tetherBalance}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>لغو</Button>
            <Button onClick={handleSave} variant='contained' color='primary'>
              ذخیره
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </TableContainer>
  )
}

export default UserManagement
