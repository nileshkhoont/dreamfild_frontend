import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes";
import "./App.css";
import Navigation from "./components/Layout/Navigation";
import { AuthProvider, useAuth } from "./utils/AuthContext";
import { Box, CircularProgress } from "@mui/material";
import ErrorBoundary from "./ErrorBoundary";
import { EmployeeProvider } from "./utils/EmployeeContext";
// ...existing code...
import { SnackbarProvider, useGlobalSnackbar } from "./utils/SnackbarContext";

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <EmployeeProvider>
            <SnackbarProvider>
              <AppContent />
            </SnackbarProvider>
          </EmployeeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

// Separate this into its own component
const AppContent = () => {
  const { isLoading, isAuthenticated, user } = useAuth();
  const showSnackbar = useGlobalSnackbar();

  // Show notifications from localStorage on mount
  useEffect(() => {
    const notifications = JSON.parse(
      localStorage.getItem("leaveNotifications") || "[]"
    );
    if (notifications.length > 0) {
      // Show the latest notification
      const latest = notifications[notifications.length - 1];
      showSnackbar(
        latest.message,
        latest.status === "approved" ? "success" : "error"
      );
    }
  }, [showSnackbar]);

  // ...socket.io logic removed...

  // ...socket.io logic removed...

  useEffect(() => {
    setFaviconBadge(false);
  }, []);

  return (
    <>
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 64px)",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <AppRoutes />
      )}
    </>
  );
};

function setFaviconBadge(showBadge) {
  console.log("setFaviconBadge called with:", showBadge);

  const favicon = document.querySelector("link[rel~='icon']");
  if (!favicon) return;

  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = favicon.href;
  img.crossOrigin = "anonymous";

  img.onload = () => {
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);

    if (showBadge) {
      // Bigger red badge (bottom-right)
      const outerRadius = 7.5;
      const outerX = size - outerRadius - 2;
      const outerY = size - outerRadius - 2;

      ctx.beginPath();
      ctx.arc(outerX, outerY, outerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = "#f23f42"; // Discord red
      ctx.fill();

      // Inner white dot
      const innerRadius = 3;
      ctx.beginPath();
      ctx.arc(outerX, outerY, innerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }

    favicon.href = canvas.toDataURL("image/png");
  };

  img.onerror = () => {
    console.error("Failed to load favicon image.");
  };
}

export default App;
