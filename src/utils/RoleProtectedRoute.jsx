import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const RoleProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();

  // Get logged-in user from localStorage
  const loggedInUser = React.useMemo(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }, []);

  // Check if user has required role
  const hasRequiredRole = loggedInUser && allowedRoles.includes(loggedInUser.role);

  if (!loggedInUser) {
    // If no user is logged in, redirect to login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!hasRequiredRole) {
    // If user doesn't have required role, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
