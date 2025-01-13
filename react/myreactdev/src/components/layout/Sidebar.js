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
} from "@mui/material";
import AuthContext from "contexts/AuthContext";
import UserService from "services/UserService";
import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  People as PeopleIcon,
  AccountBalanceWallet as WalletIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitToAppIcon,
  Pageview as PageviewIcon,
  ManageAccounts as ManageAccountsIcon,
  AttachMoney as MoneyIcon,
  SwapHoriz as SwapIcon,
} from "@mui/icons-material";

const menuItems = [
  { text: "صفحه اصلی", icon: <HomeIcon />, path: "/" },
  { text: "مدیریت کاربر", icon: <PeopleIcon />, path: "/addnewuser" },
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
  { text: "معامله روی خط", icon: <SwapIcon />, path: "/live-transaction" },
  { text: "موجودی", icon: <WalletIcon />, path: "/balances" },
  { text: "داشبورد ادمین", icon: <DashboardIcon />, path: "/AdminDashboard" },
  { text: "واریز", icon: <MoneyIcon />, path: "/deposit" },
  { text: "قیمت صرافی‌ها", icon: <MoneyIcon />, path: "/exchange-prices" },
  { text: "استعلام کارت شبا", icon: <PageviewIcon />, path: "/JibitPage" },
  { text: "برداشت‌ها", icon: <ExitToAppIcon />, path: "/WithdrawPage" },
  { text: "معاملات کلی", icon: <SwapIcon />, path: "/AllTransactionsPage" },
  {
    text: "برداشت‌های کلی",
    icon: <ExitToAppIcon />,
    path: "/AllWithdrawalsPage",
  },
  {
    text: "مدیریت نقش‌ها و مجوزها",
    icon: <ManageAccountsIcon />,
    path: "/RolesPermissionsManager",
  },
  { text: "مدیریت صفحات", icon: <PageviewIcon />, path: "/PageManager" },
  { text: "پروفایل", icon: <SwapIcon />, path: "/ProfilePage" },
  {
    text: "TestRefreshTokenPage",
    icon: <SwapIcon />,
    path: "/TestRefreshTokenPage",
  },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);
  const userID = userInfo?.UserID;

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

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={toggleSidebar}
      variant="temporary"
      PaperProps={{
        sx: {
          width: 260,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.25)",
        },
      }}
    >
      {/* اطلاعات کاربر */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 2,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
        }}
      >
        {loading ? (
          <CircularProgress
            sx={{ color: theme.palette.primary.contrastText, marginBottom: 2 }}
          />
        ) : user ? (
          <>
            <Avatar
              sx={{ width: 64, height: 64, marginBottom: 1 }}
              src="https://via.placeholder.com/64"
              alt={user.name}
            />
            <Typography variant="h6">{user.name}</Typography>
            {user.roles.map((role, index) => (
              <Typography key={index} variant="body">
                {role}
              </Typography>
            ))}
          </>
        ) : (
          <Typography variant="body">خطا در دریافت اطلاعات کاربر</Typography>
        )}
      </Box>
      <Divider />
      {/* منوی سایدبار */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
                "&.Mui-selected": {
                  backgroundColor: theme.palette.action.selected,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.text.primary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  color: theme.palette.text.primary,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
