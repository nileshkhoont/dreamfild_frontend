import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGetOrganizationFeaturesQuery } from '../API/organization';
import LoadingLayout from '../components/Layout/LoadingLayout';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText,
  Box,
  Button,
  Typography
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const FeatureProtectedRoute = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [showNoFeaturesModal, setShowNoFeaturesModal] = useState(true);
  
  // Get logged-in user from localStorage
  const loggedInUser = (() => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  })();

  // Super admin can access their specific routes without feature check
  const isSuperAdmin = loggedInUser?.role === "super-admin";
  if (isSuperAdmin) {
    // Super admin only accesses the organization page, which is already protected by RoleProtectedRoute
    return <Outlet />;
  }

  // For other users, check features from API
  const { data: featuresData, isLoading, isError } = useGetOrganizationFeaturesQuery(
    loggedInUser?.organization?._id,
    { skip: !loggedInUser?.organization?._id }
  );

  // Show loading while fetching features
  if (isLoading) {
    return <LoadingLayout />;
  }

  // Handle no features or error cases with a modal
  if (isError || !featuresData?.responseData || featuresData.responseData.length === 0) {
    // Always show user profile page content if they're on that route
    if (currentPath === '/user-profile') {
      return <Outlet />;
    }

    return (
      <>
        <Dialog
          open={showNoFeaturesModal}
          onClose={() => {}} // Empty function to prevent closing with Escape key
          aria-labelledby="no-features-dialog-title"
          maxWidth="sm"
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: '10px',
              p: 1
            }
          }}
        >
          <DialogTitle id="no-features-dialog-title" sx={{ pb: 0 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <WarningIcon sx={{ color: 'warning.main', fontSize: 28 }} />
              <Typography variant="h6" fontWeight={600}>
                No Features Available
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2, mt: 1 }}>
              You don't have access to any features in the system. Please contact your administrator to assign features to your account.
            </DialogContentText>
            <Box display="flex" justifyContent="flex-end" mt={2}>
  <Button 
    onClick={() => {
      setShowNoFeaturesModal(false);
      window.location.href = '/user-profile';
    }} 
    variant="contained" 
    size="small"
    sx={{
      backgroundColor: "var(--purpleShadeBg)",
      color: "white",
      borderRadius: "12px",
      fontWeight: 500,
      fontSize: "14px",
      textTransform: "none",
      px: 2,
      py: 1,
      height: "40px",
      minWidth: "120px",
      boxShadow: "none",
      "&:hover": {
        backgroundColor: "var(--purpleShadeBg)",
        boxShadow: "none",
      },
    }}
  >
    Go to Profile
  </Button>
</Box>
          </DialogContent>
        </Dialog>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh'
          }}
        >
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            No Features Available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please contact your administrator for assistance.
          </Typography>
        </Box>
      </>
    );
  }

  // Get feature names from API
  const featureNames = featuresData.responseData.map(feature => feature.name);
  
  // Map current path to feature name
  let requiredFeature = '';
  
  // Map routes to features
  switch (currentPath) {
    case '/dashboard':
      requiredFeature = 'Dashboard';
      break;
    case '/attendance':
      requiredFeature = 'Attendance';
      break;
    case '/leave':
      requiredFeature = 'Leave';
      break;
    case '/reports':
      requiredFeature = 'Reports';
      break;
    case '/message':
      requiredFeature = 'Message';
      break;
    case '/user-list':
      requiredFeature = 'Users';
      break;
    case '/task-list':
      requiredFeature = 'Tasks';
      break;
    case '/view-task':
      requiredFeature = 'Tasks'; // View task requires the Tasks feature
      break;
    case '/register':
      if (loggedInUser?.role === 'admin') {
        return <Outlet />;
      }
      requiredFeature = 'Register';
      break;
    case '/user-profile':
      return <Outlet />;
    case '/notifications':
      // Allow notifications route for both admin and user roles, even if not in features
      if (loggedInUser?.role === 'user' || loggedInUser?.role === 'admin') {
        return <Outlet />;
      }
      requiredFeature = 'Notification'; // fallback if you want to restrict by feature
      break;
    case '/work-from-home':
      requiredFeature = 'Work from Home'; // Match API feature name exactly
      // Only allow user and admin roles
      if (loggedInUser?.role !== 'user' && loggedInUser?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
      }
      break;
    case '/upload-documents':
      requiredFeature = 'Upload Document';
      break;
    case '/assets': // <-- Add this line
      requiredFeature = 'Assets';
      break;
    case '/assign-assets':
      requiredFeature = 'Assets';
      break;
    default:
      // For unknown paths, redirect to the first available feature
      // Find the first available feature to redirect to
      const defaultMenuPriority = ["Dashboard", "Attendance", "Leave", "Reports", "Message", "Users", "Tasks"];
      let defaultRedirectPath = '/user-profile';
      
      for (const item of defaultMenuPriority) {
        if (featureNames.includes(item)) {
          defaultRedirectPath = '/' + item.toLowerCase().replace(' ', '-');
          if (item === "Users") {
            defaultRedirectPath = "/user-list";
          } else if (item === "Tasks" && loggedInUser?.role === "user") {
            defaultRedirectPath = "/view-task";
          }
          break;
        }
      }
      
      return <Navigate to={defaultRedirectPath} replace />;
  }

  // Check if user has the required feature
  if (!featureNames.includes(requiredFeature)) {
    // Find the first available feature to redirect to
    const menuPriority = ["Dashboard", "Attendance", "Leave", "Reports", "Message", "Users", "Tasks"];
    let redirectPath = '/user-profile';
    
    // Try to find an accessible feature
    let foundFeature = false;
    for (const item of menuPriority) {
      if (featureNames.includes(item)) {
        foundFeature = true;
        redirectPath = '/' + item.toLowerCase().replace(' ', '-');
        if (item === "Users") {
          redirectPath = "/user-list";
        } else if (item === "Tasks" && loggedInUser?.role === "user") {
          redirectPath = "/view-task";
        }
        break;
      }
    }
    
    // If no feature is found, show the no features message
    if (!foundFeature) {
      return (
        <>
          <Dialog
            open={showNoFeaturesModal}
            onClose={() => {}}
            aria-labelledby="no-features-dialog-title"
            maxWidth="sm"
            PaperProps={{
              elevation: 3,
              sx: {
                borderRadius: '10px',
                p: 1
              }
            }}
          >
            <DialogTitle id="no-features-dialog-title" sx={{ pb: 0 }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <WarningIcon sx={{ color: 'warning.main', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600}>
                  No Features Available
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2, mt: 1 }}>
                You don't have access to any features in the system. Please contact your administrator to assign features to your account.
              </DialogContentText>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button 
                  onClick={() => {
                    setShowNoFeaturesModal(false);
                    window.location.href = '/user-profile';
                  }} 
                  variant="contained" 
                  color="primary"
                  sx={{ borderRadius: '8px' }}
                >
                  Go to Profile
                </Button>
              </Box>
            </DialogContent>
          </Dialog>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '80vh'
            }}
          >
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              No Features Available
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please contact your administrator for assistance.
            </Typography>
          </Box>
        </>
      );
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  // User has the required feature, allow access
  return <Outlet />;
};

export default FeatureProtectedRoute;