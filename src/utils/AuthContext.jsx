import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiSlice } from "../apiService";
// ...existing code...

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Utility
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [punchEvent, setPunchEvent] = useState(0);
  const [user, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ On App Load: Check tokens
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const authState = localStorage.getItem("isAuthenticated");

        if (!token) return;

        setIsAuthenticated(authState === "true");

        if (authState === "true" && location.pathname === "/") {
          navigate("/dashboard");
        }
      } catch {
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, [navigate, location]);

  // Add this function:
  const updateUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  // ✅ Login: Set storage, connect socket, redirect
  const handleLogin = (data) => {
    // New API: { statusCode, data: { userData }, message }
    const userData = data?.data?.userData;
    if (!userData?.token) return;

    localStorage.setItem("jwt", userData.token);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);

    const userRole = userData?.role;
    if (userRole === "super-admin") {
      navigate("/organization", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  // ✅ Logout: Clear storage, disconnect socket, reset API state
  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.setItem("isAuthenticated", "false");

    setIsAuthenticated(false);
  // disconnectSocket();
    apiSlice.util?.resetApiState?.();
    navigate("/", { replace: true }); // <-- use replace to reset history
  };

  // Optional app-level trigger
  const triggerPunch = () => setPunchEvent((prev) => prev + 1);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
        punchEvent,
        triggerPunch,
        user, // <-- expose user state
        updateUser, // <-- expose updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
