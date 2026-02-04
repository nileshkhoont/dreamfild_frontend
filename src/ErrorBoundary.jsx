import React from 'react';
import { Box, Button, Typography, Collapse } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    
    this.setState({ error, errorInfo });
  }

  componentDidUpdate(prevProps) {
    // Reset error state if the location changes
    if (this.props.location !== prevProps.location) {
      this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            padding: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body1" gutterBottom>
            An unexpected error has occurred. Please try refreshing the page or contact support if the problem persists.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReload}
            sx={{ marginTop: 2 }}
          >
            Reload Page
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={this.props.onGoHome}
            sx={{ marginTop: 1 }}
          >
            Go to Home Page
          </Button>
          <Button
            variant="text"
            color="secondary"
            onClick={this.toggleDetails}
            sx={{ marginTop: 1 }}
          >
            {this.state.showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          <Collapse in={this.state.showDetails}>
            <Box sx={{ textAlign: 'left', marginTop: 2 }}>
              <Typography variant="body2" color="error">
                {this.state.error && this.state.error.toString()}
              </Typography>
              <Typography variant="body2" color="error">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </Typography>
            </Box>
          </Collapse>
        </Box>
      );
    }

    return this.props.children; 
  }
}

function ErrorBoundaryWrapper(props) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoHome = () => {
    navigate('/');
  };

  return <ErrorBoundary {...props} onGoHome={handleGoHome} location={location} />;
}

export default ErrorBoundaryWrapper;