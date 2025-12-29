import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Typography,
  IconButton,
  Badge,
  Tooltip,
  useScrollTrigger,
  Slide,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  InputAdornment,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { useMediaQuery, useTheme } from "@mui/material";
import {
  NotificationsOutlined,
  Settings,
  Person,
  ExitToApp,
  ChevronRight,
  LocationOn,
  LocationOff,
  AddLocation,
} from "@mui/icons-material";
import Sync from "@mui/icons-material/Sync";
import PersonIcon from "@mui/icons-material/Person";
import { MdLogout } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { useAuth } from "../../utils/AuthContext";
import {
  useGetPunchStatusQuery,
  usePunchInMutation,
  usePunchOutMutation,
  useSetLocationMutation,
  useGetLocationQuery,
  useSyncTallyDataMutation,
} from "../../apiService";
import "../../App.css";
import { FaLocationDot } from "react-icons/fa6";
import LocationModal from "./LocationModal";
import DeleteDialogBox from "../../components/DeleteDialogBox";
// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: "#fff",
  boxShadow: "0 0px 0px rgba(0, 70, 246, 0.2)",
  backdropFilter: "blur(8px)",
  transition: "all 0.3s ease",
  position: "fixed",
  width: "100%",
  top: 0,
  left: 0,
  right: 0,
  height: "64px",
  zIndex: 1200,
}));

const StyledButton = styled(Button)(({ theme, active }) => ({
  margin: theme.spacing(0, 1),
  borderRadius: "8px",
  padding: theme.spacing(1, 2),
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  backgroundColor: active ? alpha("#0046f6", 0.15) : "transparent",
  "&:hover": {
    backgroundColor: alpha("#0046f6", 0.2),
    transform: "translateY(-2px)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: "50%",
    width: active ? "100%" : "0%",
    height: "2px",
    backgroundColor: theme.palette.common.white,
    transition: "all 0.3s ease",
    transform: "translateX(-50%)",
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  cursor: "pointer",
  width: "40px",
  height: "40px",
  backgroundColor: "#1f1f1f", // dark neutral background (same as notification icon)
  border: "2px solid #fff",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,

  [theme.breakpoints.down("md")]: {
    width: "36px",
    height: "36px",
    "&:hover": {
      transform: "scale(1.03)",
    },
  },
}));

// Updated Menu positioning
const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    boxShadow: "0 8px 32px rgba(60, 72, 100, 0.10)",
    border: "none",
    minWidth: 220,
    borderRadius: 0, // Remove radius
    padding: 0,
    marginTop: 1.5,
    background: "#fff",
  },
  "& .MuiMenuItem-root": {
    borderRadius: 8,
    margin: "4px 12px",
    padding: "10px 16px",
    fontWeight: 500,
    color: "var(--textColor)",
    transition: "background 0.18s, color 0.18s",
    // Remove all hover/active/focus overrides here
  },
  "& .MuiDivider-root": {
    display: "none",
  },
  "& .MuiBackdrop-root": {
    backgroundColor: "transparent",
  },
}));

const CustomMenuItem = styled(MenuItem)(({ theme }) => ({
  fontWeight: 500,
  borderRadius: 8,
  transition: "background 0.18s, color 0.18s, border-radius 0.18s",
  "&:hover": {
    backgroundColor: "var(--hoverBackgroundColor)",
    color: "var(--textColor)",
    borderRadius: 8,
  },
}));

const StyledIconWrapper = styled(Box)(({ theme }) => ({
  cursor: "pointer",
  width: 42,
  height: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "#fafafa", // very light gray
    borderRadius: "50%",
  },

  [theme.breakpoints.down("md")]: {
    width: 38,
    height: 38,
  },
}));

const Navigation = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [locationModal, setLocationModal] = useState(false);
  const [locationFormData, setLocationFormData] = useState({
    longitude: "",
    latitude: "",
    radius: "",
    address: "",
    punchOutHour: "",
    punchOutMinute: "",
    punchOutPeriod: "PM",
    missingPunchOutHour: "",
    missingPunchOutMinute: "",
    missingPunchOutPeriod: "PM",
  });
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(""); // "in" or "out"
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const locationPath = useLocation();
  const { isAuthenticated, isLoading, logout, user, triggerPunch } = useAuth();
  const userFromLocalStorage = JSON.parse(localStorage.getItem("user") || "{}");


  const getCurrentUser = () => {
    return user;
  };

  const currentUser = getCurrentUser();
  const isTrial = currentUser?.organization?.isTrial;
  const isUserRole = currentUser?.role === "user";

  // console.log("Is trial user:", isTrial);

  // Function to get current location with improved accuracy
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation API is not supported in your browser"));
        return;
      }

      setIsGettingLocation(true);
      console.log("Starting geolocation request with high accuracy...");

      // Check if we're on HTTPS or localhost (required for location on mobile)
      const isSecureContext =
        window.isSecureContext ||
        location.protocol === "https:" ||
        location.hostname === "localhost";
      console.log("Secure context:", isSecureContext);

      if (!isSecureContext) {
        const errorMessage =
          "Location services require HTTPS. Please access the site via HTTPS.";
        setLocationError(errorMessage);
        setIsGettingLocation(false);
        reject(new Error(errorMessage));
        return;
      }

      // Check permissions first (if supported)
      if ("permissions" in navigator) {
        navigator.permissions
          .query({ name: "geolocation" })
          .then((permissionStatus) => {
            console.log(
              "Geolocation permission status:",
              permissionStatus.state
            );

            if (permissionStatus.state === "denied") {
              const errorMessage =
                "Location permission denied. Please enable location access in your browser settings and refresh the page.";
              setLocationError(errorMessage);
              setIsGettingLocation(false);
              reject(new Error(errorMessage));
              return;
            }

            // Proceed with location request
            requestLocation();
          })
          .catch(() => {
            // Fallback if permissions API not supported
            requestLocation();
          });
      } else {
        // Fallback if permissions API not supported
        requestLocation();
      }

      function requestLocation() {
        var options = {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        };

        console.log("🔧 DEVELOPMENT MODE: Using relaxed location settings");

        // Try with high accuracy first
        navigator.geolocation.getCurrentPosition(
          function success(pos) {
            const crd = pos.coords;

            console.log("Your current position is:");
            console.log(`Latitude : ${crd.latitude}`);
            console.log(`Longitude: ${crd.longitude}`);
            console.log(`More or less ${crd.accuracy} meters.`);

            // Check accuracy - very lenient for local testing
            const maxAccuracy = 2200; // Allow up to 200 meters accuracy
            console.log(
              "🔧 DEVELOPMENT: Using relaxed accuracy of",
              maxAccuracy,
              "meters"
            );

            if (crd.accuracy > maxAccuracy) {
              console.log(
                "High accuracy failed, trying with lower accuracy settings..."
              );

              // Fallback: Try with lower accuracy requirements
              const fallbackOptions = {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 30000, // Allow 30 second old location
              };

              navigator.geolocation.getCurrentPosition(
                function fallbackSuccess(fallbackPos) {
                  const fallbackCrd = fallbackPos.coords;
                  console.log(
                    "Fallback location obtained:",
                    fallbackCrd.accuracy,
                    "meters accuracy"
                  );

                  const coords = {
                    latitude: fallbackCrd.latitude,
                    longitude: fallbackCrd.longitude,
                    accuracy: fallbackCrd.accuracy,
                  };

                  setLocation(coords);
                  setLocationError(null);
                  setIsGettingLocation(false);
                  resolve(coords);
                },
                function fallbackError(fallbackErr) {
                  handleLocationError(fallbackErr);
                },
                fallbackOptions
              );
              return;
            }

            const coords = {
              latitude: crd.latitude,
              longitude: crd.longitude,
              accuracy: crd.accuracy,
            };

            setLocation(coords);
            setLocationError(null);
            setIsGettingLocation(false);
            console.log(
              "✅ Location accuracy acceptable:",
              Math.round(crd.accuracy),
              "meters"
            );
            resolve(coords);
          },
          function error(err) {
            handleLocationError(err);
          },
          options
        );
      }

      function handleLocationError(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);

        let errorMessage = "Please enable your GPS position feature.";
        let instructions = "";

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Location access denied.";
            instructions =
              "Please enable location permissions in your browser settings:\n\n" +
              "• Chrome: Settings > Privacy > Site Settings > Location\n" +
              "• Safari: Settings > Privacy & Security > Location Services\n" +
              "• Firefox: Settings > Privacy & Security > Permissions\n\n" +
              "Then refresh this page and try again.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            instructions =
              "Please ensure:\n" +
              "• GPS/Location Services are enabled on your device\n" +
              "• You have a stable internet connection\n" +
              "• You are not in an area with poor GPS signal";
            break;
          case err.TIMEOUT:
            errorMessage = "Location request timed out.";
            instructions =
              "Please ensure GPS is enabled and you have a clear view of the sky. Try again in a few moments.";
            break;
          default:
            errorMessage = "Unable to get your location.";
            instructions = "Please check your location settings and try again.";
            break;
        }

        const fullErrorMessage = `${errorMessage}\n\n${instructions}`;
        setLocationError(fullErrorMessage);
        setIsGettingLocation(false);
        reject(new Error(fullErrorMessage));
      }
    });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    // Prevent body scroll manipulation
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "0px";
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Reset body scroll state
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "0px";
  };

  // Add cleanup effect
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0px";
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      handleMenuClose();
      navigate("/");
    } catch (error) {}
  };

  const [punchIn, { data: punchInData, isLoading: isPunchingIn }] =
    usePunchInMutation();
  const [punchOut, { data: punchOutData, isLoading: isPunchingOut }] =
    usePunchOutMutation();
  const [setLocationMutation, { isLoading: isSettingLocation }] =
    useSetLocationMutation();
  const [syncTallyData, { isLoading: isSyncing }] = useSyncTallyDataMutation();

  // Only call the API if user role is 'user'
  const { data: punchStatusData, isLoading: isPunchStatusLoading } =
    useGetPunchStatusQuery(undefined, {
      skip: !isUserRole, // Skip the query if user role is not 'user'
    });

  // Get location settings for admin users
  const isAdminRole =
    currentUser?.role === "admin" || currentUser?.role === "hr";
  const { data: locationData, isLoading: isLocationLoading } =
    useGetLocationQuery(undefined, {
      skip: !isAdminRole, // Only fetch for admin/hr users
    });

  // Function to determine current punch status
  const getCurrentPunchStatus = () => {
    if (!punchStatusData?.responseData?.punchDetails?.length) {
      return "punch-in"; // Default to show punch-in if no data
    }

    // Get the latest punch record (first item in array since backend sends latest first)
    const latestPunch = punchStatusData.responseData.punchDetails[0];

    // If punchOutTime is null, user is currently punched in - show punch out button
    if (latestPunch.punchInStatus && latestPunch.punchOutTime === null) {
      return "punch-out";
    }

    // If both punch in and punch out are completed, show punch in button for next session
    if (latestPunch.punchInStatus && latestPunch.punchOutTime !== null) {
      return "punch-in";
    }

    // Default case
    return "punch-in";
  };

  const currentPunchStatus = getCurrentPunchStatus();
  const shouldShowPunchIn = currentPunchStatus === "punch-in";
  const shouldShowPunchOut = currentPunchStatus === "punch-out";

  const handlePunchOut = async () => {
    try {
      setSnackbar({
        open: true,
        message: "Getting your location...",
        severity: "info",
      });
      const coords = await getCurrentLocation();

      setSnackbar({
        open: true,
        message: "Processing punch out...",
        severity: "info",
      });

      const response = await punchOut({
        latitude: coords.latitude,
        longitude: coords.longitude,

        timestamp: new Date().toISOString(),
      });

      // Always show backend message if available
      if (response?.data) {
        setSnackbar({
          open: true,
          message: response.data?.responseMessage || "Punch out successful!",
          severity: "success",
        });
        triggerPunch();
      } else if (response?.error) {
        const errorData = response.error?.data;
        setSnackbar({
          open: true,
          message:
            errorData?.responseMessage ||
            response.error?.message ||
            "Failed to punch out",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error?.data?.responseMessage ||
          error.message ||
          "Failed to punch out. Please try again.",
        severity: "error",
      });
    }
  };

  const handlePunchIn = async () => {
    try {
      setSnackbar({
        open: true,
        message: "Getting your location...",
        severity: "info",
      });
      const coords = await getCurrentLocation();

      setSnackbar({
        open: true,
        message: "Processing punch in...",
        severity: "info",
      });

      const response = await punchIn({
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: new Date().toISOString(),
      });

      if (response?.data) {
        setSnackbar({
          open: true,
          message: response.data?.responseMessage || "Punch in successful!",
          severity: "success",
        });
        triggerPunch();
      } else if (response?.error) {
        const errorData = response.error?.data;
        setSnackbar({
          open: true,
          message:
            errorData?.responseMessage ||
            response.error?.message ||
            "Failed to punch in",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error?.data?.responseMessage ||
          error.message ||
          "Failed to punch in. Please try again.",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSync = async () => {
    try {
      // Sync all Tally master data
      const events = [
        'fetch_active_company',
        'fetch_ledgers',
        'fetch_stock_items',
        'fetch_sales',
        'fetch_purchase',
        'fetch_credit_note',
        'fetch_debit_note',
        'fetch_outstanding_receivables',
        'fetch_payment',
        'fetch_cash_receipt',
        'fetch_sale_return',
        'fetch_cash_discount_journal_voucher',
        'fetch_special_discount_journal_voucher',
        'fetch_journal'
      ];
      
      await syncTallyData(events).unwrap();
      setSnackbar({
        open: true,
        message: "Tally data synced successfully!",
        severity: "success"
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to sync tally data. Please try again.",
        severity: "error"
      });
    }
  };

  // Check if user role is 'user' to show punch buttons
  const isUserRoleFunction = () => {
    const currentUser = localUser || user;
    return currentUser?.role === "user";
  };

  const isActive = (path) => {
    return locationPath.pathname === path;
  };

  // Location modal handlers
  const handleLocationModalOpen = () => {
    setLocationModal(true);
    handleMenuClose();
  };

  const handleLocationModalClose = () => {
    setLocationModal(false);
    if (!locationData?.data?.allowedLatitude) {
      setLocationFormData({
        longitude: "",
        latitude: "",
        radius: "",
        address: "",
        punchOutHour: "",
        punchOutMinute: "",
        punchOutPeriod: "PM",
        missingPunchOutHour: "",
        missingPunchOutMinute: "",
        missingPunchOutPeriod: "PM",
      });
    }
  };

  const handleLocationFormChange = (e) => {
    const { name, value } = e.target;
    if (
      [
        "punchOutHour",
        "punchOutMinute",
        "punchOutPeriod",
        "missingPunchOutHour",
        "missingPunchOutMinute",
        "missingPunchOutPeriod",
      ].includes(name)
    ) {
      setLocationFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (name === "address") {
      setLocationFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      const numericValue = value.replace(/[^0-9.-]/g, "");
      setLocationFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    }
  };
  const handleLocationFormSave = async () => {
    // Validate form data
    if (
      !locationFormData.longitude ||
      !locationFormData.latitude ||
      !locationFormData.radius
    ) {
      setSnackbar({
        open: true,
        message: "Please fill in longitude, latitude, and radius fields",
        severity: "error",
      });
      return;
    }

    // Combine punch out time from dropdowns
    let punchOutTime = "";
    if (
      locationFormData.punchOutHour &&
      locationFormData.punchOutMinute &&
      locationFormData.punchOutPeriod
    ) {
      punchOutTime = `${locationFormData.punchOutHour}:${locationFormData.punchOutMinute} ${locationFormData.punchOutPeriod}`;
    }

    // Combine missing punch out time from dropdowns
    let missingPunchOutTime = "";
    if (
      locationFormData.missingPunchOutHour &&
      locationFormData.missingPunchOutMinute &&
      locationFormData.missingPunchOutPeriod
    ) {
      missingPunchOutTime = `${locationFormData.missingPunchOutHour}:${locationFormData.missingPunchOutMinute} ${locationFormData.missingPunchOutPeriod}`;
    }

    try {
      const response = await setLocationMutation({
        allowedLatitude: parseFloat(locationFormData.latitude),
        allowedLongitude: parseFloat(locationFormData.longitude),
        allowedRadius: parseFloat(locationFormData.radius),
        address: locationFormData.address || "",
        punchOutTime: punchOutTime,
        missingPunchOutTime: missingPunchOutTime,
      }).unwrap();

      setSnackbar({
        open: true,
        message: response?.message || "Location saved successfully!",
        severity: "success",
      });

      handleLocationModalClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to save location",
        severity: "error",
      });
    }
  };

  // Check if admin needs to set location and show popup
  React.useEffect(() => {
    if (isAdminRole && !isLocationLoading && locationData) {
      const hasLocationSettings =
        locationData?.data &&
        locationData.data.allowedLatitude &&
        locationData.data.allowedLongitude &&
        locationData.data.allowedRadius;

      if (!hasLocationSettings) {
        // Auto-open location modal if no location is set
        setLocationModal(true);
      }
    }
  }, [isAdminRole, isLocationLoading, locationData]);

  // Pre-fill form with existing location data if available
  React.useEffect(() => {
    // Only set form data if locationData.data has all three required values and they are numbers
    if (
      locationData?.data &&
      typeof locationData.data.allowedLatitude === "number" &&
      typeof locationData.data.allowedLongitude === "number" &&
      typeof locationData.data.allowedRadius === "number"
    ) {
      // Parse punchOutTime
      let punchOutHour = "",
        punchOutMinute = "",
        punchOutPeriod = "PM";
      if (locationData.data.punchOutTime) {
        const [time, per] = locationData.data.punchOutTime.split(" ");
        [punchOutHour, punchOutMinute] = time.split(":");
        punchOutPeriod = per || "PM";
      }
      // Parse missingPunchOutTime
      let missingPunchOutHour = "",
        missingPunchOutMinute = "",
        missingPunchOutPeriod = "PM";
      if (locationData.data.missingPunchOutTime) {
        const [time, per] = locationData.data.missingPunchOutTime.split(" ");
        [missingPunchOutHour, missingPunchOutMinute] = time.split(":");
        missingPunchOutPeriod = per || "PM";
      }
      setLocationFormData({
        latitude: locationData.data.allowedLatitude.toString(),
        longitude: locationData.data.allowedLongitude.toString(),
        radius: locationData.data.allowedRadius.toString(),
        address: locationData.data.address || "",
        punchOutHour,
        punchOutMinute,
        punchOutPeriod,
        missingPunchOutHour,
        missingPunchOutMinute,
        missingPunchOutPeriod,
      });
    } else {
      setLocationFormData({
        latitude: "",
        longitude: "",
        radius: "",
        address: "",
        punchOutHour: "",
        punchOutMinute: "",
        punchOutPeriod: "PM",
        missingPunchOutHour: "",
        missingPunchOutMinute: "",
        missingPunchOutPeriod: "PM",
      });
    }
  }, [locationData]);

  const LogoWrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "left",
    justifyContent: "start",
    padding: theme.spacing(2, 0),
    cursor: "pointer",
    transition: "transform 0.3s ease",
    flex: 1, // Take available space
    "&:hover": {
      transform: "scale(1.03)",
    },
    // Remove absolute positioning for mobile
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(1, 0),
    },
  }));
  const menuItems = [
    // Show Profile for all users
    {
      text: "Profile",
      icon: (
        <PersonIcon
          fontSize="small"
          sx={{ color: "var(--purpleShadeBg)", mr: 1 }}
        />
      ),
      onClick: () => {
        navigate("/user-profile");
        handleMenuClose();
      },

      sx: {
        fontWeight: 500,
        color: "var(--textColor)",
        borderRadius: 1,
        "&:hover": {
          background: "rgba(114, 103, 240, 0.08)",
          color: "var(--hoverBackgroundColor)",
        },
      },
    },
    // Add Location menu item - only show for admin/hr users
    ...(isAdminRole
      ? [
          {
            text: "Set Location",
            icon: (
              <AddLocation
                fontSize="small"
                sx={{ color: "var(--purpleShadeBg)", mr: 1 }}
              />
            ),
            onClick: handleLocationModalOpen,
            divider: true,
            sx: {
              fontWeight: 500,
              color: "var(--textColor)",
              borderRadius: "8px",
              "&:hover": {
                background: "rgba(114, 103, 240, 0.08)",
                color: "var(--purpleShadeBg)",
              },
            },
          },
        ]
      : []),
    {
      text: "Logout",
      icon: (
        <ExitToApp
          fontSize="small"
          sx={{ color: "var(--purpleShadeBg)", mr: 1 }}
        />
      ),
      onClick: handleLogout,
      divider: true,
      sx: {
        fontWeight: 500,
        color: "var(--textColor)",
        borderRadius: "8px",
        "&:hover": {
          background: "rgba(114, 103, 240, 0.08)",
          color: "var(--purpleShadeBg)",
        },
      },
    },
  ];


  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const isNotifOpen = Boolean(notifAnchorEl);

  const handlePunchInClick = () => {
    setConfirmAction("in");
    setConfirmDialogOpen(true);
  };

  const handlePunchOutClick = () => {
    setConfirmAction("out");
    setConfirmDialogOpen(true);
  };
  const handleSyncClick = () => {
    setConfirmAction("sync");
    setConfirmDialogOpen(true);
  };
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
    // Delay resetting confirmAction until dialog is fully closed
    setTimeout(() => {
      setConfirmAction("");
    }, 200); // 200ms matches MUI Dialog close animation
  };

  const handleConfirmDialogProceed = async () => {
    setConfirmDialogOpen(false);
    if (confirmAction === "in") {
      await handlePunchIn();
    } else if (confirmAction === "out") {
      await handlePunchOut();
    } else if (confirmAction === "sync") {
      await handleSync();
    }
    setConfirmAction("");
  };

  return (
    <>
      <StyledAppBar>
        <Toolbar
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "64px",
            px: { xs: 1, sm: 2 },
            position: "relative",
            // Prevent layout shift
            overflow: "visible",
          }}
        >
          {/* Left side - Space for hamburger on mobile */}
          <Box
            sx={{
              width: { xs: 50, md: 0 },
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          />

          {/* Center - Logo */}
          {/* <LogoWrapper
            onClick={() => {
              navigate("/dashboard");
            }}
          >
            <Box
              component="img"
              src="/logo1.png"
              alt="Company Logo"
              sx={{
                height: { xs: 28, sm: 32, md: 36 },
                maxWidth: "100%",
                display: "block",
              }}
            />
          </LogoWrapper> */}

          {/* Right side - User actions */}
          {isLoading ? (
            <CircularProgress
              color="inherit"
              size={24}
              sx={{
                animation: "fadeIn 0.3s ease-in",
                flexShrink: 0,
              }}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 1 },
                flexShrink: 0,
                // Ensure fixed width container
                minWidth: { xs: "auto", sm: "auto" },
              }}
            >
              {!isAuthenticated ? (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <StyledButton
                    color="inherit"
                    component={Link}
                    to="/"
                    active={isActive("/")}
                    sx={{
                      display: { xs: "none", sm: "inline-flex" },
                    }}
                  >
                    Login
                  </StyledButton>
                  <StyledButton
                    color="inherit"
                    component={Link}
                    to="/signup"
                    active={isActive("/signup")}
                    sx={{
                      display: { xs: "none", sm: "inline-flex" },
                    }}
                  >
                    Sign Up
                  </StyledButton>
                </Box>
              ) : (
                <>
                  {/* Show Punch In/Out buttons only for users with 'user' role */}
                  {isUserRole && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: { xs: 0.25, sm: 1 },
                        flexDirection: "row", // Always horizontal
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {/* Show Punch In Button */}

                      {shouldShowPunchIn && (
                        <Button
                          variant="contained"
                          size="small"
                          disabled={
                            isPunchingIn ||
                            isPunchingOut ||
                            isGettingLocation ||
                            isPunchStatusLoading
                          }
                          onClick={handlePunchInClick}
                          sx={{
                            backgroundColor: "var(--successBgColor)",
                            color: "var(--successTextColor)",
                            borderRadius: "12px",
                            fontWeight: 500,
                            fontSize: "14px",
                            textTransform: "none",
                            px: 2,
                            py: 1,
                            height: "40px",
                            minWidth: isSmallScreen ? "40px" : "120px",
                            boxShadow: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: isSmallScreen ? 0 : 1,
                            opacity:
                              isPunchingIn ||
                              isPunchingOut ||
                              isGettingLocation ||
                              isPunchStatusLoading
                                ? 0.7
                                : 1,
                            transition: "background 0.2s, color 0.2s",
                            "&:hover": {
                              backgroundColor: "var(--successBgColor)",
                              boxShadow: "none",
                            },
                          }}
                        >
                          {isPunchingIn ||
                          (isGettingLocation && !isPunchingOut) ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <LocationOn sx={{ fontSize: 20 }} />
                          )}
                          {!isSmallScreen && (
                            <span>
                              {isPunchingIn ||
                              (isGettingLocation && !isPunchingOut)
                                ? "Processing..."
                                : "Punch In"}
                            </span>
                          )}
                        </Button>
                      )}

                      {shouldShowPunchOut && (
                        <Button
                          variant="contained"
                          size="small"
                          disabled={
                            isPunchingIn ||
                            isPunchingOut ||
                            isGettingLocation ||
                            isPunchStatusLoading
                          }
                          onClick={handlePunchOutClick}
                          sx={{
                            backgroundColor: "var(--redShadeBg)",
                            color: "var(--redShadeColor)",
                            borderRadius: "12px",
                            fontWeight: 500,
                            fontSize: "14px",
                            textTransform: "none",
                            px: 2,
                            py: 1,
                            height: "40px",
                            minWidth: isSmallScreen ? "40px" : "120px",
                            boxShadow: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: isSmallScreen ? 0 : 1,
                            opacity:
                              isPunchingIn ||
                              isPunchingOut ||
                              isGettingLocation ||
                              isPunchStatusLoading
                                ? 0.7
                                : 1,
                            transition: "background 0.2s, color 0.2s",
                            "&:hover": {
                              backgroundColor: "var(--redShadeBg)",
                              boxShadow: "none",
                            },
                          }}
                        >
                          {isPunchingOut ||
                          (isGettingLocation && !isPunchingIn) ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <LocationOff sx={{ fontSize: 20 }} />
                          )}
                          {!isSmallScreen && (
                            <span>
                              {isPunchingOut ||
                              (isGettingLocation && !isPunchingIn)
                                ? "Processing..."
                                : "Punch Out"}
                            </span>
                          )}
                        </Button>
                      )}

                      {/* Loading state when fetching punch status */}
                      {isPunchStatusLoading && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", px: 1 }}
                        >
                          <CircularProgress size={20} />
                        </Box>
                      )}
                    </Box>
                  )}
                  {isTrial && (
                    <button
                      style={{
                        color: "var(--yellowShadeBg)",
                        backgroundColor: "var(--yellowShadeColor)",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 16px",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",

                        textTransform: "none",
                      }}
                    >
                      <Box sx={{ display: "block" }}>Trial</Box>
                    </button>
                  )}

                  {/* Sync button styled like Punch Out but different color */}
                  <Button
                    variant="contained"
                    size="small"
                    disabled={isSyncing}
                    onClick={handleSyncClick}
                    sx={{
  backgroundColor: "rgba(25, 118, 210, 0.12)", // Light and transparent blue
  color: "#1976d2", // Dark blue text for contrast
  borderRadius: "12px",
  fontWeight: 600,
  fontSize: "14px",
  textTransform: "none",
  px: 2.5, // Reduced padding
  py: 1.25,
  height: "36px", // Slightly shorter height
  minWidth: isSmallScreen ? "36px" : "100px", // Reduced width
  boxShadow: isSyncing ? "none" : "0 1px 4px rgba(25, 118, 210, 0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: isSmallScreen ? 0 : 0.75,
  ml: 1,
  opacity: isSyncing ? 0.7 : 1,
  transition: "all 0.3s ease",
  border: "1px solid rgba(25, 118, 210, 0.2)", // Subtle border for definition
  "&:hover": {
    backgroundColor: "rgba(25, 118, 210, 0.2)", // Slightly more opaque on hover
    boxShadow: "0 2px 8px rgba(25, 118, 210, 0.3)",
    borderColor: "rgba(25, 118, 210, 0.4)",
  },
}}

                  >
                    {isSyncing ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Sync sx={{ fontSize: 20 }} />
                    )}
                    {!isSmallScreen && (
                      <span>{isSyncing ? "Syncing..." : "Sync"}</span>
                    )}
                  </Button>



                  <StyledAvatar
                    onClick={handleMenuOpen}
                    sx={{
                      ml: 0.5,
                      transform: "none !important",
                      transition: "box-shadow 0.3s ease !important",

                      "&.Mui-focusVisible": {
                        transform: "none !important",
                      },
                    }}
                  >
                    {currentUser?.profilePhoto ? (
                      <img
                        src={currentUser.profilePhoto}
                        alt={currentUser.name || "Profile"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      <Person
                        sx={{
                          color: "#fff",
                          fontSize: { xs: "1.25rem", sm: "1.5rem" },
                        }}
                      />
                    )}
                  </StyledAvatar>

                  <StyledMenu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    disableScrollLock={true}
                    sx={{
                      "& .MuiPaper-root": {
                        boxShadow: "0 8px 32px rgba(60, 72, 100, 0.10)",
                        border: "none",
                        minWidth: 220,
                        borderRadius: 2, // Remove radius
                        padding: 0,
                        marginTop: 1.5,
                        background: "#fff",
                      },
                      "& .MuiMenuItem-root": {
                        borderRadius: 8,
                        margin: "4px 12px",
                        padding: "10px 16px",
                        fontWeight: 500,
                        color: "var(--textColor)",
                        transition: "background 0.18s, color 0.18s",
                        // Remove all hover/active/focus overrides here
                      },
                      "& .MuiDivider-root": {
                        display: "none",
                      },
                      "& .MuiBackdrop-root": {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <Box sx={{ px: 2, pt: 0.5, pb: 0.5 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{
                          fontSize: 16,
                          color: "var(--textColor)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {`Welcome back, `}
                        <br />
                        <span style={{ color: "#1875d9" }}>
                          {currentUser?.name || "User"}
                        </span>
                      </Typography>
                    </Box>

                    

                    <CustomMenuItem onClick={() => setLogoutDialogOpen(true)}>
                      <MdLogout
                        size={20}
                        style={{
                          color: "var(--purpleShadeBg)",
                          marginRight: 8,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, ml: 1 }}
                      >
                        Logout
                      </Typography>
                    </CustomMenuItem>
                  </StyledMenu>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </StyledAppBar>

      {/* Location Modal */}
      <LocationModal
        open={locationModal}
        onClose={handleLocationModalClose}
        isAdminRole={isAdminRole}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={handleSnackbarClose}
        sx={{ zIndex: 9999 }}
        disablePortal={false}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>



      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogClose}
        aria-labelledby="confirm-punch-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 0,
            minWidth: 340,
            boxShadow: "0 8px 32px rgba(60,72,100,0.15)",
            borderTop: `6px solid ${
              confirmAction === "in"
                ? "#43a047"
                : confirmAction === "out"
                ? "#d32f2f"
                : "#1976d2"
            }`,
            background: "#fff",
          },
        }}
      >
        <DialogTitle
          id="confirm-punch-dialog-title"
          sx={{
            fontWeight: 700,
            fontSize: "1.15rem",
            pb: 0.5,
            pt: 2,
            color:
              confirmAction === "in"
                ? "#43a047"
                : confirmAction === "out"
                ? "#d32f2f"
                : "#1976d2",
            textAlign: "center",
            letterSpacing: 0.2,
          }}
        >
          {confirmAction === "in"
            ? "Confirm Punch In"
            : confirmAction === "out"
            ? "Confirm Punch Out"
            : "Confirm Sync"}
        </DialogTitle>

        <DialogContent sx={{ pb: 1, px: 3 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: "1rem",
              textAlign: "center",
              mb: 1,
            }}
          >
            {confirmAction === "in"
              ? "Are you sure you want to punch in?"
              : confirmAction === "out"
              ? "Are you sure you want to punch out?"
              : "Are you sure you want to sync Tally products?"}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 2, gap: 2 }}>
          <Button
            onClick={handleConfirmDialogClose}
            color="inherit"
            sx={{
              textTransform: "none",
              fontSize: "0.95rem",
              px: 2.5,
              py: 0.75,
              minWidth: 90,
              borderRadius: 2,
              boxShadow: "none",
              border: "1px solid #eee",
              background: "#f7f7f7",
              "&:hover": {
                background: "#ededed",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDialogProceed}
            variant="contained"
            color={
              confirmAction === "in" ? "success" : confirmAction === "out" ? "error" : "primary"
            }
            sx={{
              textTransform: "none",
              fontSize: "0.95rem",
              px: 2.5,
              py: 0.75,
              minWidth: 90,
              borderRadius: 2,
              boxShadow: "none",
              fontWeight: 600,
            }}
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <DeleteDialogBox
        deleteDialogOpen={logoutDialogOpen}
        handleCancelDelete={() => setLogoutDialogOpen(false)}
        handleConfirmDelete={async () => {
          await handleLogout();
          setLogoutDialogOpen(false);
        }}
        isDeleting={false}
        name={currentUser?.name}
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
      />
    </>
  );
};

export default Navigation;
