import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  CircularProgress,
  useTheme,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import AuthContext from "contexts/AuthContext";
import UserService from "services/UserService";
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitToAppIcon,
  Pageview as PageviewIcon,
  ManageAccounts as ManageAccountsIcon,
  AttachMoney as MoneyIcon,
  SwapHoriz as SwapIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  CreditCard as CreditCardIcon,
  EventNote as EventNoteIcon,
  Shield as ShieldIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  ImportExport as ImportExportIcon,
  Notifications as NotificationsIcon,
  PriceChange as PriceChangeIcon,
  Assessment as AssessmentIcon,
  Equalizer as EqualizerIcon,
  Login as LoginIcon,
  Block as BlockIcon,
} from "@mui/icons-material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CircleNotificationsIcon from "@mui/icons-material/CircleNotifications";
import SendIcon from "@mui/icons-material/Send";

const groupedMenuItems = [
  {
    title: "داشبوردها",
    items: [
      { text: "صفحه اصلی", icon: <HomeIcon />, path: "/DashboardPage" },
      {
        text: "داشبورد ادمین",
        icon: <DashboardIcon />,
        path: "/AdminDashboard",
      },
      {
        text: "داشبورد مالی",
        icon: <AssessmentIcon />,
        path: "/FinancialDashboard",
      },
      {
        text: "داشبورد رویدادها",
        icon: <EventNoteIcon />,
        path: "/CartModal",
      },
    ],
  },
  {
    title: "مدیریت کاربران",
    items: [
      { text: "مدیریت کاربران", icon: <PeopleIcon />, path: "/addnewuser" },
      { text: "پروفایل", icon: <ManageAccountsIcon />, path: "/profilePage" },
      {
        text: "مدیریت محدودیت‌های کاربران",
        icon: <BlockIcon />,
        path: "/UserManagement",
      },
    ],
  },
  {
    title: "معاملات",
    items: [
      {
        text: "معامله اتوماتیک",
        icon: <SwapIcon />,
        path: "/automatic-transaction",
      },
      {
        text: "معامله پیشنهادی",
        icon: <MoneyIcon />,
        path: "/suggested-transaction",
      },
      {
        text: "معاملات فردایی",
        icon: <ImportExportIcon />,
        path: "/live-transaction",
      },
      {
        text: "معامله‌گری",
        icon: <PriceChangeIcon />,
        path: "/BuySellPage",
      },
      {
        text: "تمام معاملات",
        icon: <AssessmentIcon />,
        path: "/AllTransactionsPage",
      },
      {
        text: "معاملات",
        icon: <SwapIcon />,
        path: "/Transaction",
      },
    ],
  },
  {
    title: "امور مالی",
    items: [
      {
        text: "موجودی‌ها",
        icon: <AccountBalanceWalletIcon />,
        path: "/balances",
      },
      { text: "واریز", icon: <MoneyIcon />, path: "/deposit" },
      { text: "برداشت ریالی", icon: <ExitToAppIcon />, path: "/WithdrawPage" },
      {
        text: "برداشت‌های کلی",
        icon: <PaymentIcon />,
        path: "/AllWithdrawalsPage",
      },
      {
        text: "درخواست برداشت USDT",
        icon: <ExitToAppIcon />,
        path: "/WithdrawUSDTPage",
      },
      {
        text: "کیف پول‌های کاربران (USDT)",
        icon: <AccountBalanceWalletIcon />,
        path: "/UsersWalletsPage",
      },
      {
        text: "شارژ دستی",
        icon: <PaymentIcon />,
        path: "/ManageUserFinancial",
      },
      {
        text: "سیستم برابری (مدیریتی)",
        icon: <EqualizerIcon />,
        path: "/EqualityCheckPage",
      },
    ],
  },
  {
    title: "مدیریت سیستم",
    items: [
      {
        text: "مدیریت نقش‌ها و مجوزهای کاربران",
        icon: <ShieldIcon />,
        path: "/RolesPermissionsManager",
      },
      {
        text: "مدیریت صفحه‌ها",
        icon: <PageviewIcon />,
        path: "/PageManager",
      },
      {
        text: "مدیریت نقش‌ها",
        icon: <ManageAccountsIcon />,
        path: "/RoleManagement",
      },
      {
        text: "مدیریت مجوزها",
        icon: <ShieldIcon />,
        path: "/PermissionManagement",
      },
      {
        text: "مدیریت نقش‌های کاربران",
        icon: <ManageAccountsIcon />,
        path: "/UserRoleManagement",
      },
      {
        text: "مدیریت توکن",
        icon: <SettingsIcon />,
        path: "/TokenManagerPage",
      },
    ],
  },
  {
    title: "اطلاع‌رسانی‌ها",
    items: [
      {
        text: "اطلاع‌رسانی‌ها",
        icon: <CircleNotificationsIcon />,
        path: "/Notifications",
      },
      {
        text: "ارسال اطلاع‌رسانی",
        icon: <SendIcon />,
        path: "/SendNotificationPage",
      },
      {
        text: "ارسال اطلاع‌رسانی Push",
        icon: <SendIcon />,
        path: "/SendPushNotificationPage",
      },
    ],
  },
  {
    title: "خدمات و استعلام‌ها",
    items: [
      {
        text: "قیمت صرافی‌ها",
        icon: <MoneyIcon />,
        path: "/exchange-prices",
      },
      {
        text: "استعلام جیبیت",
        icon: <CreditCardIcon />,
        path: "/JibitPage",
      },
    ],
  },
  {
    title: "سایر",
    items: [
      {
        text: "تست رفرش توکن",
        icon: <SettingsIcon />,
        path: "/TestRefreshTokenPage",
      },
      {
        text: "ورود",
        icon: <LoginIcon />,
        path: "/login",
      },
      {
        text: "دسترسی غیرمجاز",
        icon: <BlockIcon />,
        path: "/unauthorized",
      },
    ],
  },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);
  const userID = userInfo?.UserID;
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userID) {
        console.error("User ID not found");
        setLoading(false);
        return;
      }
      try {
        const data = await UserService.getUserDetails(userID);
        setUser({
          name: `${data.FirstName} ${data.LastName}`,
          roles: data.Roles?.map((role) => role.RoleName) || ["نامشخص"],
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userID]);

  const filteredMenuItems = groupedMenuItems.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.text.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  return (
    <Drawer
      anchor="left" // تغییر به راست برای پشتیبانی بهتر از زبان فارسی
      open={isOpen}
      onClose={toggleSidebar}
      variant="temporary"
      PaperProps={{
        sx: {
          width: isMobile ? "80%" : 280,
          background: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(5px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 2,
          color: theme.palette.text.primary,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.25)",
          transition: "transform 0.3s ease-in-out",
          direction: "rtl", // اضافه کردن جهت RTL برای فارسی
        },
      }}
    >
      {/* هدر کاربر با افکت شیشه‌ای */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
          borderRadius: 1,
          mb: 1,
        }}
      >
        {loading ? (
          <CircularProgress sx={{ color: theme.palette.text.primary, mb: 2 }} />
        ) : user ? (
          <>
            <Avatar
              sx={{ width: 64, height: 64, mb: 1 }}
              src="https://via.placeholder.com/64"
              alt={user.name}
            />
            <Typography variant="h6">{user.name}</Typography>
            {user.roles.map((role, index) => (
              <Typography key={index} variant="body2">
                {role}
              </Typography>
            ))}
          </>
        ) : (
          <Typography variant="body2">خطا در دریافت اطلاعات کاربر</Typography>
        )}
      </Box>
      <Divider />
      {/* جستجو */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          placeholder="جستجو در منو..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
          sx={{ mb: 2, direction: "rtl" }}
        />
      </Box>
      {/* منو */}
      <List>
        {filteredMenuItems.map((group) =>
          group.items.length > 0 ? (
            <Accordion
              key={group.title}
              disableGutters
              elevation={0}
              defaultExpanded={false}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{group.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {group.items.map((item) => (
                    <ListItem key={item.text} disablePadding>
                      <ListItemButton
                        component={Link}
                        to={item.path}
                        selected={location.pathname === item.path}
                        sx={{
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                            transform: "translateX(-5px)", // تغییر برای RTL
                            transition: "transform 0.2s ease-in-out",
                          },
                          "&.Mui-selected": {
                            borderRight: `4px solid ${theme.palette.primary.main}`, // تغییر به راست برای RTL
                            backgroundColor: theme.palette.action.selected,
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: theme.palette.text.primary,
                            minWidth: 40,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ) : null
        )}
      </List>
    </Drawer>
  );
};

export default Sidebar;
