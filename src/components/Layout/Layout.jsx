import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";

const Layout = () => {
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
    </Box>
  );
};

export default Layout;
