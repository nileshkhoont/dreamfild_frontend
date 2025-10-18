import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  alpha,
  IconButton,
  Button,
  Avatar,
  ListItemAvatar,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Outlet, useNavigate, useLocation  } from "react-router-dom";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";
// ...existing code...
import { useEmployee } from "../../utils/EmployeeContext";
import { Skeleton } from "@mui/material";
import { PersonOffOutlined } from "@mui/icons-material";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GroupIcon from "@mui/icons-material/Group";
import CloseIcon from "@mui/icons-material/Close";


const Layout = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
   const [sidebarOpenParent, setSidebarOpenParent] = useState(null);
  const [employeeDrawerOpen, setEmployeeDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:898px)");

  // Check if EmployeeList should be shown
  const loggedInUser = React.useMemo(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }, []);

  const shouldShowEmployeeList =
    loggedInUser?.role !== "user" && loggedInUser?.role !== "super-admin";

  const handleEmployeeDrawerToggle = () => {
    setEmployeeDrawerOpen(!employeeDrawerOpen);
  };

  const handleEmployeeDrawerClose = () => {
    setEmployeeDrawerOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minHeight: "100vh",
      }}
    >
      <Navigation sx={{ backgroundColor: "#fff" }} />
      <Sidebar
        sx={{ backgroundColor: "#fff" }}
        openParent={sidebarOpenParent}
        setOpenParent={setSidebarOpenParent}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "calc(100% - 80%)", // Reduce main box width slightly
          minHeight: "100vh",
          transition: "all 0.3s ease",
        }}
      >
        <Container
          sx={{
            pt: 4,
            maxWidth: "100% !important",
            width: "100%",
            px: 0,
          }}
        >
          <Box sx={{ my: 4, width: "100%" }}>
            <Outlet />
          </Box>
        </Container>
      </Box>

      {/* Employee Button for toggling the drawer */}
      {shouldShowEmployeeList && (
        <Box
          onClick={handleEmployeeDrawerToggle}
          sx={{
            display: employeeDrawerOpen ? 'none' : 'flex', // Hide when drawer is open
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            bottom: 100,
            right: 2,
            zIndex: employeeDrawerOpen ? -1 : 1300, // Lower z-index when drawer is open
            width: 56,
            height: 56,
            backgroundColor: "white",
            borderRadius: "50%",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
            cursor: "pointer", // Add cursor pointer for better UX
            transition: 'opacity 0.3s ease', // Smooth transition
            opacity: employeeDrawerOpen ? 0 : 1, // Fade out when drawer is open
          }}
        >
          <IconButton
            sx={{
              color: "#0046f6",
              padding: 0,
              "&:hover": {
                backgroundColor: "rgba(0, 70, 246, 0.1)",
              },
            }}
          >
            <GroupIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default Layout;
