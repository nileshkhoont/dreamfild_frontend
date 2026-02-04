import React from 'react';
import { Outlet } from 'react-router-dom';

const FeatureProtectedRoute = () => {
  // Get logged-in user from localStorage
  const loggedInUser = (() => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  })();

  // Super admin can access their specific routes without feature check
  if (loggedInUser?.role === 'super-admin') {
    return <Outlet />;
  }

  // For all other users, just allow access (feature protection removed)
  return <Outlet />;
};

export default FeatureProtectedRoute;