import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardContent,
  Slide,
  Box, // Import Box for layout
} from '@mui/material'
import { styled } from '@mui/material/styles'

// ترنزیشن Slide برای انیمیشن مودال
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})

// استایل‌های سفارشی برای مودال
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.background.default,
    backgroundImage: 'linear-gradient(145deg, #373b44, rgb(90, 132, 204))',
    color: theme.palette.text.primary,
    borderRadius: '15px',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
  },
}))

// استایل‌های سفارشی برای کارت‌ها
const StyledCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  background: 'linear-gradient(10deg,rgb(39, 102, 23),rgb(58, 113, 177))',
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)',
  },
}))

// استایل‌های سفارشی برای محتوای کارت
const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '& .MuiTypography-body1': {
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
  '& .MuiTypography-body2': {
    color: theme.palette.common.white,
  },
}))

// توابع کمکی برای استخراج اطلاعات آیتم
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
const getItemAmount = item => item?.Amount || item?.Quantity || 'N/A'

const DetailsModal = ({ open, onClose, title, data }) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      fullWidth
      maxWidth='md'
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.5rem',
          color: 'theme.palette.common.white',
          backgroundColor: 'rgb(180, 192, 211)',
          py: 2,
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ py: 3, paddingTop: '20px !important' }}>
        {data.length === 0 ? (
          <Typography
            variant='body1'
            align='center'
            sx={{ color: 'text.secondary' }}
          >
            هیچ داده‌ای موجود نیست.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'flex', // Flexbox layout
              flexWrap: 'wrap', // کارت‌ها به صورت خودکار به خط بعدی منتقل می‌شوند
              gap: 2, // فاصله بین کارت‌ها
              justifyContent: 'center', // کارت‌ها در مرکز قرار می‌گیرند
            }}
          >
            {data.map((item, index) => (
              <StyledCard
                key={index}
                sx={{ width: '100%', maxWidth: 300, mb: 1 }}
              >
                <StyledCardContent>
                  {/* ID */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{ textAlign: 'left', color: '#9e9e9e' }}
                    >
                      {getItemId(item)}
                    </Typography>
                    <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                      شناسه:
                    </Typography>
                  </Box>

                  {/* کاربر */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{ textAlign: 'left', color: '#9e9e9e' }}
                    >
                      {getItemUser(item)}
                    </Typography>
                    <Typography variant='body2'>کاربر:</Typography>
                  </Box>

                  {/* وضعیت */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{ textAlign: 'left', color: '#9e9e9e' }}
                    >
                      {getItemStatus(item)}
                    </Typography>
                    <Typography variant='body2'>وضعیت:</Typography>
                  </Box>

                  {/* تاریخ */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{ textAlign: 'left', color: '#9e9e9e' }}
                    >
                      {getItemDate(item)}
                    </Typography>
                    <Typography variant='body2'>تاریخ:</Typography>
                  </Box>

                  {/* مقدار */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{ textAlign: 'left', color: '#9e9e9e' }}
                    >
                      {getItemAmount(item) || '-'}
                    </Typography>
                    <Typography variant='body2'>مقدار:</Typography>
                  </Box>

                  {/* ادرس مقصد (اگر موجود باشد) */}
                  {item.DestinationAddress && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant='body2'
                        sx={{ textAlign: 'left', color: '#9e9e9e' }}
                      >
                        {item.DestinationAddress}
                      </Typography>
                      <Typography variant='body2'>ادرس مقصد:</Typography>
                    </Box>
                  )}

                  {/* گیرنده (اگر موجود باشد) */}
                  {item.AccountHolderName && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant='body2'
                        sx={{ textAlign: 'left', color: '#9e9e9e' }}
                      >
                        {item.AccountHolderName}
                      </Typography>
                      <Typography variant='body2'>گیرنده:</Typography>
                    </Box>
                  )}

                  {/* شبا (اگر موجود باشد) */}
                  {item.IBAN && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant='body2'
                        sx={{ textAlign: 'left', color: '#9e9e9e' }}
                      >
                        {item.IBAN}
                      </Typography>
                      <Typography variant='body2'>شبا:</Typography>
                    </Box>
                  )}

                  {/* نوع ارز (اگر موجود باشد) */}
                  {item.CurrencyType && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant='body2'
                        sx={{ textAlign: 'left', color: '#9e9e9e' }}
                      >
                        {item.CurrencyType}
                      </Typography>
                      <Typography variant='body2'>ارز:</Typography>
                    </Box>
                  )}
                </StyledCardContent>
              </StyledCard>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 1 }}>
        <Button
          variant='contained'
          onClick={onClose}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          بستن
        </Button>
      </DialogActions>
    </StyledDialog>
  )
}

export default DetailsModal
