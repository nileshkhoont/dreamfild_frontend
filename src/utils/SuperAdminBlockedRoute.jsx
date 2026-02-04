import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const SuperAdminBlockedRoute = ({ blockedRoles = [] }) => {
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

  // Check if user has a blocked role
  const isBlocked = loggedInUser && blockedRoles.includes(loggedInUser.role);

  if (!loggedInUser) {
    // If no user is logged in, redirect to login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (isBlocked) {
    // If user has a blocked role, redirect to organization page
    return <Navigate to="/organization" replace />;
  }

  return <Outlet />;
};

export default SuperAdminBlockedRoute;
