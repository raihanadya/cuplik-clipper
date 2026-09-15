import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth.js';
import { ROUTES } from '../constants/routes.js';

export function GuestOnlyRoute({ children }) {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    if (role === 'admin') {
      return <Navigate to={ROUTES.ADMIN} replace />;
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}

export default GuestOnlyRoute;
