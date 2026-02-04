import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LoadingLayout from './../components/Layout/LoadingLayout';

const ProtectedRoute = ({ authenticationRequired = true }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [redirectPath, setRedirectPath] = useState('/dashboard');
  const [isRedirectReady, setIsRedirectReady] = useState(false);

  // Get logged-in user from localStorage
  const loggedInUser = (() => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  })();

  const isSuperAdmin = loggedInUser?.role === "super-admin";

  useEffect(() => {
    if (authenticationRequired && isAuthenticated && !isLoading) {
      // For super-admin, always redirect to organization page if on root
      if (isSuperAdmin && location.pathname === '/') {
        setRedirectPath('/organization');
        setIsRedirectReady(true);
        return;
      }
      // Only set redirect path if on root
      if (location.pathname === '/') {
        setRedirectPath(isSuperAdmin ? '/organization' : '/dashboard');
      } else {
        // For all other paths, set redirect to dashboard (or org)
        setRedirectPath(isSuperAdmin ? '/organization' : '/dashboard');
      }
      setIsRedirectReady(true);
    } else if (!authenticationRequired) {
      setIsRedirectReady(true);
    }
  }, [isAuthenticated, isLoading, isSuperAdmin, loggedInUser?.role, authenticationRequired, location.pathname]);

  // console.log('Debug Info:', {
  //   role: loggedInUser?.role,
  //   currentPath: location.pathname,
  //   redirectPath,
  //   isAuthenticated,
  //   isRedirectReady
  // });

  if (isLoading || (authenticationRequired && isAuthenticated && !isRedirectReady)) {
    return <LoadingLayout />;
  }

  if (authenticationRequired) {
    if (!isAuthenticated) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
    if (location.pathname === '/') {
      return <Navigate to={redirectPath} replace />;
    }
    return <Outlet />;
  } else {
    return isAuthenticated ? <Navigate to={redirectPath} replace /> : <Outlet />;
  }
};

export default ProtectedRoute;