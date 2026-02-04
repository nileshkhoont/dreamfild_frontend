import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import Sidebar from './Sidebar';
import { useAuth } from '../../utils/AuthContext';

const LoadingLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {isAuthenticated && <Sidebar />}
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f1f1' }}>
        <CircularProgress />
      </Box>
    </Box>
  );
};

export default LoadingLayout;