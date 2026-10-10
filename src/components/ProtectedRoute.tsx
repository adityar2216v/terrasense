import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const role = localStorage.getItem('userRole');
  const location = useLocation();

  if (!role) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Logged in but not allowed
    // Redirect based on role
    if (role === 'admin') return <Navigate to="/app/admin" replace />;
    if (role === 'org') return <Navigate to="/app/org" replace />;
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};
