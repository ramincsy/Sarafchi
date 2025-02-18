import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "components/layout/Layout";
import { AuthProvider } from "contexts/AuthContext";
import { PermissionsProvider } from "contexts/PermissionsContext";
import { DarkModeProvider, useDarkMode } from "contexts/DarkModeContext";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "themes/themes";
import { publicRoutes, protectedRoutes } from "./routes/routes";
import ProtectedRoute from "components/common/ProtectedRoute";

const Loading = () => <div>Loading...</div>;

function App() {
  return (
    <DarkModeProvider>
      <MainApp />
    </DarkModeProvider>
  );
}

function MainApp() {
  // حالتی که از useDarkMode استفاده می‌کنیم، پس DarkModeProvider باید در بالای MainApp قرار داشته باشد.
  const { mode } = useDarkMode();
  const theme = mode === "light" ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <PermissionsProvider>
            <Suspense fallback={<Loading />}>
              <Routes>
                {publicRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ))}
                {protectedRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <ProtectedRoute>
                        <Layout>{route.element}</Layout>
                      </ProtectedRoute>
                    }
                  />
                ))}
              </Routes>
            </Suspense>
          </PermissionsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
