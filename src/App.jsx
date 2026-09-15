import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext.jsx';
import { ROUTES } from './constants/routes.js';

// Layouts
import { PublicLayout } from './layouts/PublicLayout.jsx';
import { AuthLayout } from './layouts/AuthLayout.jsx';
import { AppLayout } from './layouts/AppLayout.jsx';
import { AdminLayout } from './layouts/AdminLayout.jsx';

// Route Guards
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { AdminRoute } from './routes/AdminRoute.jsx';
import { GuestOnlyRoute } from './routes/GuestOnlyRoute.jsx';

// Pages
import { LandingPage } from './pages/landing/LandingPage.jsx';
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { AdminLoginPage } from './pages/auth/AdminLoginPage.jsx';
import { RegisterPage } from './pages/auth/RegisterPage.jsx';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage.jsx';
import { DashboardPage } from './pages/workspace/DashboardPage.jsx';
import { UploadPage } from './pages/workspace/UploadPage.jsx';
import { ProcessingPage } from './pages/workspace/ProcessingPage.jsx';
import { ClipReviewPage } from './pages/clips/ClipReviewPage.jsx';
import { ClipEditorPage } from './pages/clips/ClipEditorPage.jsx';
import { AccountPage } from './pages/account/AccountPage.jsx';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';
import { NotFoundPage } from './pages/notFound/NotFoundPage.jsx';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing Route */}
          <Route element={<PublicLayout />}>
            <Route path={ROUTES.HOME} element={<LandingPage />} />
          </Route>

          {/* Guest-only Authentication Routes */}
          <Route
            element={
              <GuestOnlyRoute>
                <AuthLayout />
              </GuestOnlyRoute>
            }
          >
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          </Route>

          {/* Protected Workspace & Clip Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.UPLOAD} element={<UploadPage />} />
            <Route path={ROUTES.SESSION_STATUS} element={<ProcessingPage />} />
            <Route path={ROUTES.CLIPS} element={<ClipReviewPage />} />
            <Route path={ROUTES.CLIP_EDIT} element={<ClipEditorPage />} />
            <Route path={ROUTES.ACCOUNT} element={<AccountPage />} />
          </Route>

          {/* Protected Administrator Console Route */}
          <Route
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
          </Route>

          {/* 404 Catch-all Fallback */}
          <Route element={<PublicLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
