import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LoadingLayout from './../components/Layout/LoadingLayout';
import { useGetOrganizationFeaturesQuery } from '../API/organization';

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
  const { data: featuresData, isLoading: isFeaturesLoading } = useGetOrganizationFeaturesQuery(
    loggedInUser?.organization?._id,
    { 
      skip: !isAuthenticated || !loggedInUser?.organization?._id || isSuperAdmin,
    }
  );

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
        // Set default redirect based on features
        if (featuresData?.responseData && featuresData.responseData.length > 0) {
          const featureNames = featuresData.responseData.map((feature) =>
            feature.name.toLowerCase()
          );
          let filteredItems = roleBasedItems.filter((item) =>
            featureNames.includes(item.label.toLowerCase()) ||
            (item.label.toLowerCase() === "upload document" && featureNames.includes("upload document")) ||
            (item.label.toLowerCase() === "document" && featureNames.includes("upload document"))
          );
          const menuPriority = ["Dashboard", "Attendance", "Leave", "Reports", "Message", "Users", "Tasks", "View Task"];
          
          for (const item of menuPriority) {
            if (featureNames.includes(item)) {
              let path = '/' + item.toLowerCase().replace(' ', '-');
              if (item === "Tasks" && loggedInUser?.role === "user") {
                path = "/view-task";
              } else if (item === "Users") {
                path = "/user-list";
              }
              setRedirectPath(path);
              break;
            }
          }
        }
      } else {
        // For all other paths, set redirect to dashboard (or org)
        setRedirectPath(isSuperAdmin ? '/organization' : '/dashboard');
      }
      setIsRedirectReady(true);
    } else if (!authenticationRequired) {
      setIsRedirectReady(true);
    }
  }, [isAuthenticated, isLoading, isFeaturesLoading, featuresData, isSuperAdmin, loggedInUser?.role, authenticationRequired, location.pathname]);

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
    
    // If current path is '/' and authenticated, redirect to the first available feature path
    if (location.pathname === '/') {
      return <Navigate to={redirectPath} replace />;
    }
    
    return <Outlet />;
  } else {
    // Routes that don't require authentication (login page, etc.)
    return isAuthenticated ? <Navigate to={redirectPath} replace /> : <Outlet />;
  }
};

export default ProtectedRoute;