import React, { useState } from 'react'
import { useDarkMode } from 'contexts/DarkModeContext'
import { useTheme } from '@mui/material/styles' // اضافه کردن useTheme
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  MenuItem,
  Menu,
  styled,
  alpha,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  AccountCircle,
} from '@mui/icons-material'
import SubHeader from 'components/layout/SubHeader'
import Sidebar from 'components/layout/Sidebar'
import { useNavigate } from 'react-router-dom'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import NotificationIcon from 'components/layout/NotificationIcon' // آیکون نوتیفیکیشن

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}))

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}))

const Header = ({ onToggleSidebar, title = 'صرافچی' }) => {
  const { mode, toggleDarkMode } = useDarkMode()
  const theme = useTheme() // استفاده از تم
  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null)
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  const handleTitleClick = () => {
    navigate('/DashboardPage')
  }

  const isMenuOpen = Boolean(anchorEl)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    handleMobileMenuClose()
  }

  const handleMobileMenuOpen = event => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const goToProfile = () => {
    navigate('/ProfilePage')
    handleMenuClose()
  }

  const menuId = 'primary-search-account-menu'
  const renderMenu = (
    <Menu
      onClick={goToProfile}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    ></Menu>
  )

  const mobileMenuId = 'primary-search-account-menu-mobile'
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      sx={{
        '& .MuiPaper-root': {
          backdropFilter: 'blur(10px)', // جلوه شیشه‌ای
          backgroundColor:
            theme.palette.mode === 'light'
              ? 'rgba(255, 255, 255, 0.8)' // پس‌زمینه شفاف برای تم لایت
              : 'rgba(18, 18, 18, 0.8)', // پس‌زمینه شفاف برای تم دارک
          borderRadius: '12px', // گرد کردن گوشه‌ها
          boxShadow: theme.shadows[4], // سایه ملایم
        },
      }}
    >
      {/* فقط آیتم نوتیفیکیشن */}
      <MenuItem onClick={handleMobileMenuClose}>
        <NotificationIcon sx={{ marginLeft: 1 }} /> {/* آیکون نوتیفیکیشن */}
        <p>اعلان‌ها</p>
      </MenuItem>
    </Menu>
  )

  return (
    <Box>
      {/* Header */}
      <AppBar
        position='sticky'
        sx={{
          backgroundColor: theme.palette.background.header, // استفاده از رنگ پس‌زمینه هدر از تم
          color: theme.palette.text.header, // استفاده از رنگ متن هدر از تم
        }}
      >
        <Toolbar>
          {/* دکمه منو */}
          <IconButton
            size='large'
            edge='start'
            aria-label='open drawer'
            onClick={toggleSidebar}
            sx={{
              mr: 2,
              color: theme.palette.icons.menu, // استفاده از رنگ آیکون منو از تم
              backgroundColor: 'transparent', // حذف پس‌زمینه
              '&:hover': {
                backgroundColor: 'transparent', // حذف پس‌زمینه در حالت hover
              },
              '&:focus': {
                backgroundColor: 'transparent', // حذف پس‌زمینه در حالت focus
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* عنوان هدر */}
          <Typography
            variant='h6'
            noWrap
            component='div'
            onClick={handleTitleClick}
            sx={{
              display: { xs: 'none', sm: 'block' },
              color: theme.palette.text.header, // استفاده از رنگ متن هدر از تم
            }}
          >
            {title}
          </Typography>

          {/* بخش جستجو */}
          <Search>
            <SearchIconWrapper>
              <SearchIcon sx={{ color: theme.palette.icons.search }} />{' '}
              {/* استفاده از رنگ آیکون جستجو از تم */}
            </SearchIconWrapper>
            <StyledInputBase
              placeholder='جستجو…'
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>

          {/* فاصله انعطاف‌پذیر */}
          <Box sx={{ flexGrow: 1 }} />

          {/* بخش دسکتاپ */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {/* دکمه تغییر تم */}
            <IconButton
              size='large'
              aria-label='toggle dark mode'
              onClick={toggleDarkMode}
              sx={{
                ml: 2,
                color: theme.palette.icons.modeToggle, // استفاده از رنگ آیکون تغییر تم از تم
                backgroundColor: 'transparent', // حذف پس‌زمینه
                '&:hover': {
                  backgroundColor: 'transparent', // حذف پس‌زمینه در حالت hover
                },
                '&:focus': {
                  backgroundColor: 'transparent', // حذف پس‌زمینه در حالت focus
                },
              }}
            >
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>

            {/* دکمه نوتیفیکیشن */}
            <IconButton
              size='large'
              aria-label='show notifications'
              sx={{
                color: theme.palette.icons.notification, // استفاده از رنگ آیکون نوتیفیکیشن از تم
                backgroundColor: 'transparent', // حذف پس‌زمینه
                '&:hover': {
                  backgroundColor: 'transparent', // حذف پس‌زمینه در حالت hover
                },
                '&:focus': {
                  backgroundColor: 'transparent', // حذف پس‌زمینه در حالت focus
                },
              }}
            >
              <NotificationIcon />
            </IconButton>

            {/* دکمه پروفایل */}
            <IconButton
              size='large'
              edge='end'
              aria-label='account of current user'
              aria-controls={menuId}
              aria-haspopup='true'
              onClick={goToProfile}
              sx={{
                color: theme.palette.icons.profile, // استفاده از رنگ آیکون پروفایل از تم
                backgroundColor: 'transparent', // حذف پس‌زمینه
                '&:hover': {
                  backgroundColor: 'transparent', // حذف پس‌زمینه در حالت hover
                },
                '&:focus': {
                  backgroundColor: 'transparent', // حذف پس‌زمینه در حالت focus
                },
              }}
            >
              <AccountCircle />
            </IconButton>
          </Box>

          {/* بخش موبایل */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            {/* دکمه نوتیفیکیشن (جایگزین دکمه سه نقطه) */}
            <IconButton
              size='large'
              aria-label='show notifications'
              aria-controls={mobileMenuId}
              aria-haspopup='true'
              onClick={handleMobileMenuOpen}
              sx={{
                color: theme.palette.icons.notification, // استفاده از رنگ آیکون نوتیفیکیشن از تم
                backgroundColor: 'transparent', // حذف پس‌زمینه
                '&:hover': {
                  backgroundColor: 'transparent', // حذف پس‌زمینه در حالت hover
                },
                '&:focus': {
                  backgroundColor: 'transparent', // حذف پس‌زمینه در حالت focus
                },
              }}
            >
              <NotificationIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {renderMobileMenu}
      {renderMenu}

      {/* SubHeader */}
      <Box sx={{ margin: 0.5 }}>
        <SubHeader />
      </Box>
    </Box>
  )
}

export default Header
