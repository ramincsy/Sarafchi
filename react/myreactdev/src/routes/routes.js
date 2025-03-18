// src/routes/routes.js
import ProtectedRoute from "components/common/ProtectedRoute";

// Import all components directly
import LoginPage from "pages/Auth/LoginPage";
import UnauthorizedPage from "pages/Auth/UnauthorizedPage";
import DashboardPage from "pages/Dashboards/DashboardPage";
import AdminDashboard from "pages/Dashboards/AdminDashboard";
import CreateUser from "pages/CreateUser";
import ProfilePage from "pages/Profile/ProfilePage";

// Transaction related pages
import AutomaticTransaction from "pages/Transactions/AutomaticTransaction";
import SuggestedTransaction from "pages/Transactions/SuggestedTransaction";
import LiveTransaction from "pages/Transactions/LiveTransaction";
import AllTransactionsPage from "pages/Transactions/AllTransactionsPage";
import Transaction from "pages/Transactions/Transaction";

// Financial related pages
import BalancesPage from "pages/Balances/BalancesPage";
import DepositPage from "pages/Deposit/DepositPage";
import WithdrawPage from "pages/Withdrawals/WithdrawPage";
import AllWithdrawalsPage from "pages/Withdrawals/AllWithdrawalsPage";
import ExchangePrices from "pages/ExchangePrices/ExchangePrices";
import JibitPage from "pages/Jibit/JibitPage";

// Admin management pages
import RolesPermissionsManager from "pages/RolesPermissionsManager";
import PageManager from "pages/PageManager";
import RoleManagement from "pages/RoleManagement";
import PermissionManagement from "pages/PermissionManagement";
import UserRoleManagement from "pages/UserRoleManagement";
import TestRefreshTokenPage from "pages/TestRefreshTokenPage";
import UsersWalletsPage from "pages/Blockchain/Tron/UsersWalletsPage";
import SendNotificationPage from "pages/SendNotificationPage";

// import SendPushNotificationPage from "pages/SendPushNotificationPage";
import WithdrawUSDTPage from "pages/Withdrawals/WithdrawUSDTPage";
import FinancialDashboard from "pages/Dashboards/FinancialDashboard";
import CartModal from "pages/CartModal/CartModal";
import UserManagement from "pages/UserManagement";
import ManageUserFinancial from "pages/ManagePartnersBanks/ManageUserFinancial";
import EquilibriumPage from "pages/EqualitySystem/EquilibriumPage";
import EquilibriumDashboard from "pages/EqualitySystem/Dashboard/EquilibriumDashboard";
// Route configurations
export const publicRoutes = [
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
];

export const protectedRoutes = [
  {
    path: "/DashboardPage",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },

  // Dashboard Routes
  {
    path: "/AdminDashboard",
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  // User Management Routes
  {
    path: "/addnewuser",
    element: (
      <ProtectedRoute>
        <CreateUser />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ProfilePage",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  // Transaction Routes
  {
    path: "/automatic-transaction",
    element: (
      <ProtectedRoute>
        <AutomaticTransaction />
      </ProtectedRoute>
    ),
  },
  {
    path: "/suggested-transaction",
    element: (
      <ProtectedRoute>
        <SuggestedTransaction />
      </ProtectedRoute>
    ),
  },
  {
    path: "/live-transaction",
    element: (
      <ProtectedRoute>
        <LiveTransaction />
      </ProtectedRoute>
    ),
  },
  {
    path: "/AllTransactionsPage",
    element: (
      <ProtectedRoute>
        <AllTransactionsPage />
      </ProtectedRoute>
    ),
  },
  // Financial Routes
  {
    path: "/balances",
    element: (
      <ProtectedRoute>
        <BalancesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/deposit",
    element: (
      <ProtectedRoute>
        <DepositPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/WithdrawPage",
    element: (
      <ProtectedRoute>
        <WithdrawPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/AllWithdrawalsPage",
    element: (
      <ProtectedRoute>
        <AllWithdrawalsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/exchange-prices",
    element: (
      <ProtectedRoute>
        <ExchangePrices />
      </ProtectedRoute>
    ),
  },
  {
    path: "/JibitPage",
    element: (
      <ProtectedRoute>
        <JibitPage />
      </ProtectedRoute>
    ),
  },
  // Admin Management Routes
  {
    path: "/RolesPermissionsManager",
    element: (
      <ProtectedRoute>
        <RolesPermissionsManager />
      </ProtectedRoute>
    ),
  },
  {
    path: "/PageManager",
    element: (
      <ProtectedRoute>
        <PageManager />
      </ProtectedRoute>
    ),
  },
  {
    path: "/RoleManagement",
    element: (
      <ProtectedRoute>
        <RoleManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/PermissionManagement",
    element: (
      <ProtectedRoute>
        <PermissionManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/TestRefreshTokenPage",
    element: (
      <ProtectedRoute>
        <TestRefreshTokenPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/UsersWalletsPage",
    element: (
      <ProtectedRoute>
        <UsersWalletsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/SendNotificationPage",
    element: (
      <ProtectedRoute>
        <SendNotificationPage />
      </ProtectedRoute>
    ),
  },
  // {
  //   path: "/SendPushNotificationPage",
  //   element: (
  //     <ProtectedRoute>
  //       <SendPushNotificationPage />
  //     </ProtectedRoute>
  //   ),
  // },
  {
    path: "/WithdrawUSDTPage",
    element: (
      <ProtectedRoute>
        <WithdrawUSDTPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/FinancialDashboard",
    element: (
      <ProtectedRoute>
        <FinancialDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/UserRoleManagement",
    element: (
      <ProtectedRoute>
        <UserRoleManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/CartModal",
    element: (
      <ProtectedRoute>
        <CartModal />
      </ProtectedRoute>
    ),
  },
  {
    path: "/UserManagement",
    element: (
      <ProtectedRoute>
        <UserManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Transaction",
    element: (
      <ProtectedRoute>
        <Transaction />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ManageUserFinancial",
    element: (
      <ProtectedRoute>
        <ManageUserFinancial />
      </ProtectedRoute>
    ),
  },
  {
    path: "/EquilibriumPage",
    element: (
      <ProtectedRoute>
        <EquilibriumPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/EquilibriumDashboard",
    element: (
      <ProtectedRoute>
        <EquilibriumDashboard />
      </ProtectedRoute>
    ),
  },
];
