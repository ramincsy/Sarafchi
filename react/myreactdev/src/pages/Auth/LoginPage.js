import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Checkbox,
  FormControlLabel,
  Modal,
  Backdrop,
  Fade,
} from '@mui/material'
import AuthContext from 'contexts/AuthContext'
import { getOrCreateUUID } from 'utils/uuidManager'
import { getIPAddress } from 'utils/ipHelper'
import './loginStyles.css'
import logo from './logo-login.png'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [openTwoFactorModal, setOpenTwoFactorModal] = useState(false)
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  const [isFirstAuthCompleted, setIsFirstAuthCompleted] = useState(false)

  useEffect(() => {
    const checkAuthStatus = async () => {
      const needs2FA = localStorage.getItem('needs2FA')
      if (needs2FA === 'true') {
        setOpenTwoFactorModal(true)
      }
    }
    checkAuthStatus()
  }, [])
  const handleLogin = async e => {
    e.preventDefault()
    setError('')

    if (!acceptedTerms) {
      setError('لطفاً قوانین و مقررات را مطالعه و تایید کنید')
      return
    }

    setIsLoading(true)

    try {
      const deviceId = getOrCreateUUID()
      const ipAddress = await getIPAddress()

      await login(email, password, ipAddress, deviceId)

      // ذخیره وضعیت در localStorage
      localStorage.setItem('needs2FA', 'true')
      setOpenTwoFactorModal(true)
      setIsFirstAuthCompleted(true)
    } catch (err) {
      console.error('Login failed:', err)
      setError(
        err?.response?.data?.message ||
          err.message ||
          'مشکلی در ورود رخ داده است. لطفاً دوباره تلاش کنید.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactorSubmit = () => {
    if (twoFactorCode.length > 0) {
      localStorage.removeItem('needs2FA')
      navigate('/adminDashboard')

      // ریست کردن حالت‌های فرم
      setEmail('')
      setPassword('')
      setTwoFactorCode('')
      setOpenTwoFactorModal(false)
    }
  }

  return (
    <div className='glass-container'>
      <div className='wave'></div>
      <Container component='main' maxWidth='xs'>
        <Paper className='glass-card' elevation={0} sx={{ p: 4 }}>
          <Box display='flex' flexDirection='column' alignItems='center'>
            <img
              src={logo}
              alt='Logo'
              style={{
                width: '380px',
                height: 'auto',
                padding: '0px',
                aspectRatio: '1044/591',
              }}
            />
            <Typography
              component='h1'
              variant='h5'
              sx={{
                color: 'white',
                textShadow: '0 0 8px rgba(255,255,255,0.5)',
                mt: 2,
              }}
            >
              ورود
            </Typography>
          </Box>

          <Box component='form' onSubmit={handleLogin} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              required
              label='ایمیل'
              value={email}
              onChange={e => setEmail(e.target.value)}
              sx={textFieldStyle}
              InputProps={{
                sx: {
                  input: {
                    padding: '12px 14px',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              required
              label='رمز عبور'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              sx={textFieldStyle}
              InputProps={{
                sx: {
                  input: {
                    padding: '12px 14px',
                  },
                },
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    alignSelf: 'flex-start',
                    '&.Mui-checked': {
                      color: '#FE6B8B',
                    },
                  }}
                />
              }
              label={
                <Typography
                  component='span'
                  sx={{
                    color: 'white',
                    lineHeight: 1.5,
                    fontSize: '0.9rem',
                  }}
                >
                  {'قوانین و مقررات سایت را '}
                  <RouterLink
                    to='/terms'
                    style={{
                      color: '#FF8E53',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    مطالعه کردم
                  </RouterLink>
                  {' می‌پذیرم'}
                </Typography>
              }
              sx={{
                mt: 1,
                alignItems: 'flex-start',
                width: '100%',
                marginLeft: 0,
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    '&.Mui-checked': {
                      color: '#FE6B8B',
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    color: 'white',
                    fontSize: '0.9rem',
                  }}
                >
                  مرا به خاطر بسپار
                </Typography>
              }
              sx={{
                mt: 1,
                alignItems: 'flex-start',
                width: '100%',
                marginLeft: 0,
              }}
            />

            {error && (
              <Alert
                severity='error'
                sx={{
                  mt: 2,
                  backgroundColor: 'rgba(255,87,87,0.15)',
                  color: 'white',
                  border: '1px solid rgba(255,87,87,0.3)',
                }}
              >
                {error}
              </Alert>
            )}

            <Button
              type='submit'
              fullWidth
              variant='contained'
              disabled={isLoading || !acceptedTerms}
              sx={buttonStyle}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'ورود'
              )}
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* مودال احراز دو مرحله‌ای */}
      <Modal
        open={openTwoFactorModal}
        onClose={() => setOpenTwoFactorModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openTwoFactorModal}>
          <Box sx={modalStyle}>
            <Typography
              variant='h6'
              sx={{
                color: 'white',
                textAlign: 'center',
                mb: 3,
              }}
            >
              لطفاً کد ارسال شده را وارد کنید
            </Typography>
            <TextField
              fullWidth
              label='کد تایید'
              value={twoFactorCode}
              onChange={e => setTwoFactorCode(e.target.value)}
              sx={textFieldStyle}
              InputProps={{
                sx: {
                  input: {
                    textAlign: 'center',
                    letterSpacing: '8px',
                    fontSize: '1.2rem',
                  },
                },
              }}
            />
            <Button
              fullWidth
              variant='contained'
              onClick={handleTwoFactorSubmit}
              sx={buttonStyle}
            >
              تایید
            </Button>
          </Box>
        </Fade>
      </Modal>
    </div>
  )
}

// استایل‌های مشترک
const textFieldStyle = {
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.7)',
    transform: 'translate(14px, 14px)',
    '&.Mui-focused, &.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
      color: '#FE6B8B !important',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: '0 4px',
      borderRadius: '4px',
    },
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    margin: '8px 0',
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.3)',
      transition: 'all 0.3s ease',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255,255,255,0.5)',
      boxShadow: '0 0 8px rgba(255,255,255,0.2)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white !important',
      boxShadow: '0 0 12px rgba(255,255,255,0.3)',
    },
    '& input': {
      color: 'white',
      '&:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 100px rgba(0, 0, 0, 0.24) inset',
        WebkitTextFillColor: 'white !important',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        caretColor: '#FE6B8B',
      },
      '&:-webkit-autofill:hover': {
        WebkitBoxShadow: '0 0 0 100px rgba(0,0,0,0.25) inset',
      },
      '&:-webkit-autofill:focus': {
        WebkitBoxShadow: '0 0 0 100px rgba(0,0,0,0.3) inset',
      },
    },
  },
}

const buttonStyle = {
  mt: 3,
  mb: 2,
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  color: 'white',
  fontSize: '1.1rem',
  padding: '12px 24px',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
    transform: 'scale(1.02)',
  },
  '&:disabled': {
    background: 'rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.5)',
    transform: 'none',
  },
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '400px' },
  bgcolor: 'rgba(0,0,0,0.95)',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: '16px',
  boxShadow: 24,
  p: 4,
  backdropFilter: 'blur(16px)',
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.8) !important',
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
}

export default LoginPage
