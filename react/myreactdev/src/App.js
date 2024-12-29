// src/App.js
import React from "react";
import "./assets/styles/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateUser from "pages/CreateUser";
import LoginPage from "pages/Auth/LoginPage";
import Layout from "components/layout/Layout";
import { AuthProvider } from "contexts/AuthContext";
import ProtectedRoute from "components/common/ProtectedRoute";
import DashboardPage from "pages/Dashboards/DashboardPage";
// Import pages for transactions
import AutomaticTransaction from "pages/Transactions/AutomaticTransaction";
import SuggestedTransaction from "pages/Transactions/SuggestedTransaction";
import LiveTransaction from "pages/Transactions/LiveTransaction";
import BalancesPage from "pages/Balances/BalancesPage"; // Import the BalancesPage
import DepositPage from "pages/Deposit/DepositPage";
import AdminDashboard from "pages/Dashboards/AdminDashboard";
import ExchangePrices from "pages/ExchangePrices/ExchangePrices";
import JibitPage from "pages/Jibit/JibitPage";
import WithdrawPage from "pages/Withdrawals/WithdrawPage";
import AllTransactionsPage from "pages/Transactions/AllTransactionsPage";
import AllWithdrawalsPage from "pages/Withdrawals/AllWithdrawalsPage";
import RolesPermissionsManager from "pages/RolesPermissionsManager";
import PageManager from "pages/PageManager";
import { PermissionsProvider } from "contexts/PermissionsContext";
import UnauthorizedPage from "pages/Auth/UnauthorizedPage";
import ProfilePage from "pages/Profile/ProfilePage";
import { DarkModeProvider, useDarkMode } from "contexts/DarkModeContext"; // Import DarkModeProvider and useDarkMode
import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "themes/themes";
import RoleManagement from "pages/RoleManagement";
import PermissionManagement from "pages/PermissionManagement";
import UserRoleManagement from "pages/UserRoleManagement";
function App() {
  return (
    <DarkModeProvider>
      <MainApp />
    </DarkModeProvider>
  );
}
function MainApp() {
  const { mode } = useDarkMode(); // حالا اینجا کار می‌کند زیرا DarkModeProvider بالای آن است
  const theme = mode === "light" ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PermissionsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />{" "}
              {/* Unauthorized page */}
              <Route
                path="*"
                element={
                  <Layout>
                    <Routes>
                      {/* Dashboard as default route */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/addnewuser"
                        element={
                          <ProtectedRoute>
                            <CreateUser />
                          </ProtectedRoute>
                        }
                      />
                      {/* Add routes for transactions */}
                      <Route
                        path="/automatic-transaction"
                        element={
                          <ProtectedRoute>
                            <AutomaticTransaction />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/suggested-transaction"
                        element={
                          <ProtectedRoute>
                            <SuggestedTransaction />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/live-transaction"
                        element={
                          <ProtectedRoute>
                            <LiveTransaction />
                          </ProtectedRoute>
                        }
                      />
                      {/* Add BalancesPage route */}
                      <Route
                        path="/balances"
                        element={
                          <ProtectedRoute>
                            <BalancesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/AdminDashboard"
                        element={
                          <ProtectedRoute>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/deposit"
                        element={
                          <ProtectedRoute>
                            <DepositPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/exchange-prices"
                        element={
                          <ProtectedRoute>
                            <ExchangePrices />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/JibitPage"
                        element={
                          <ProtectedRoute>
                            <JibitPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/WithdrawPage"
                        element={
                          <ProtectedRoute>
                            <WithdrawPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/AllTransactionsPage"
                        element={
                          <ProtectedRoute>
                            <AllTransactionsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/AllWithdrawalsPage"
                        element={
                          <ProtectedRoute>
                            <AllWithdrawalsPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/RolesPermissionsManager"
                        element={
                          <ProtectedRoute>
                            <RolesPermissionsManager />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/PageManager"
                        element={
                          <ProtectedRoute>
                            <PageManager />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/ProfilePage"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />
                      {/* Fallback route for unmatched paths */}
                      <Route
                        path="*"
                        element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/RoleManagement"
                        element={
                          <ProtectedRoute>
                            <RoleManagement />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/PermissionManagement"
                        element={
                          <ProtectedRoute>
                            <PermissionManagement />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/UserRoleManagement"
                        element={
                          <ProtectedRoute>
                            <UserRoleManagement />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </Layout>
                }
              />
            </Routes>
          </BrowserRouter>
        </PermissionsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
