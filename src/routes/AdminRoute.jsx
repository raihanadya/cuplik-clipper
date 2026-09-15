import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth.js';
import { ROUTES } from '../constants/routes.js';

export function AdminRoute({ children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} state={{ from: location }} replace />;
  }

  if (role !== 'admin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}

export default AdminRoute;
