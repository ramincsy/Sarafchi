// src/App.js
import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage"; // Import the DashboardPage
import ListUserPage from "./pages/ListUserPage";
import CreateUser from "./pages/CreateUser";
import EditUser from "./pages/EditUser";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { DarkModeProvider } from "./components/DarkModeContext"; // Import DarkModeProvider
import ProtectedRoute from "./components/ProtectedRoute";

// Import pages for transactions
import AutomaticTransaction from "./pages/Transactions/AutomaticTransaction";
import SuggestedTransaction from "./pages/Transactions/SuggestedTransaction";
import LiveTransaction from "./pages/Transactions/LiveTransaction";
import BalancesPage from "./pages/BalancesPage"; // Import the BalancesPage
import DepositPage from "./pages/DepositPage";
import AdminDashboard from "./pages/AdminDashboard";
import ExchangePrices from "./pages/ExchangePrices";
import JibitPage from "./pages/JibitPage";
import WithdrawPage from "./pages/WithdrawPage";

function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
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
                    <Route
                      path="/user/:id/edit"
                      element={
                        <ProtectedRoute>
                          <EditUser />
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
                      path="/listusers"
                      element={
                        <ProtectedRoute>
                          <ListUserPage />
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
                    {/* Fallback route for unmatched paths */}
                    <Route
                      path="*"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;
