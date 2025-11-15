import React, { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import { Laptop } from "lucide-react";
import List from "@mui/material/List";
import { ChevronLeft } from "lucide-react";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import { useCallback } from "react";
import { styled, useTheme, useMediaQuery, alpha } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import BusinessIcon from "@mui/icons-material/Business";
import Tooltip from "@mui/material/Tooltip";
import { FaRegUserCircle } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import { ChevronRight } from "lucide-react";
import { FaListCheck } from "react-icons/fa6";
import { MdInventory2, MdAddBox, MdAssignmentReturn } from "react-icons/md"; // Add these icons

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeIcon from "@mui/icons-material/Home";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PersonIcon from "@mui/icons-material/Person";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import ChatIcon from "@mui/icons-material/Chat";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useAuth } from "../../utils/AuthContext";
import { useSetLocationMutation, useGetLocationQuery } from "../../apiService";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { AddLocation } from "@mui/icons-material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DescriptionIcon from "@mui/icons-material/Description";
import { IoCloudUploadOutline, IoDocumentAttachSharp } from "react-icons/io5";

// Import additional icons
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import GroupIcon from "@mui/icons-material/Group";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ShareIcon from "@mui/icons-material/Share";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

// 1. Update the menuItems array with different icons:
const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: DashboardOutlinedIcon,
    activeIcon: DashboardIcon,
  },
  {
    path: "/dealers",
    label: "Dealers",
    icon: GroupOutlinedIcon,
    activeIcon: GroupIcon,
  },
  {
    path: "/media",
    label: "Media",
    icon: CloudUploadOutlinedIcon,
    activeIcon: CloudUploadOutlinedIcon, // Same icon for both states
  },
  {
    path: "/scheme",
    label: "Scheme",
    icon: ShareOutlinedIcon,
    activeIcon: ShareIcon,
  },
  {
    path: "/tally-orders",
    label: "Confirm Orders",
    icon: ShoppingCartOutlinedIcon,
    activeIcon: ShoppingCartIcon,
  },
  {
    path: "/tally-products",
    label: "Tally Products",
    icon: InventoryOutlinedIcon,
    activeIcon: InventoryIcon,
  },
  {
    path: "/social-media",
    label: "Social Media",
    icon: ShareOutlinedIcon,
    activeIcon: ShareIcon,
  },
  {
    path: "/banks",
    label: "Banks",
    icon: AccountBalanceOutlinedIcon,
    activeIcon: AccountBalanceIcon,
  },
   {
    path: "/orders",
    label: "Orders",
    icon: ShoppingCartOutlinedIcon,
    activeIcon: ShoppingCartIcon,
  },
  // {
  //   path: "/attendance",
  //   label: "Attendance",
  //   icon: FaListCheck,
  //   activeIcon: FaListCheck,
  // },
  // {
  //   path: "/reports",
  //   label: "Reports",
  //   icon: BarChartOutlinedIcon,
  //   activeIcon: BarChartIcon,
  // },
  {
    path: "/organization",
    label: "Organization",
    icon: BusinessOutlinedIcon,
    activeIcon: BusinessIcon,
  },
  {
    path: "/org-user-list",
    label: "Org User List",
    icon: PersonOutlineOutlinedIcon,
    activeIcon: PersonIcon,
  },
];

// Styled components
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
  minHeight: "64px !important",
  backgroundColor: "#ffffff",
  color: "#75c174",
  transition: "all 0.3s ease-in-out", // Add smooth transition
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(0, 0.5),
    minHeight: "56px !important",
  },
}));

const LogoWrapper = styled(Box)(({ theme, collapsed }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: collapsed ? "center" : "flex-start",
  padding: theme.spacing(collapsed ? 0 : 2, 0),
  cursor: "pointer",
  transition: "all 0.3s ease-in-out", // Smooth transition
  flex: 1,
  borderRadius: 8,
  "&:hover": {
    transform: "scale(1.02)",
  },
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(1, 0),
  },
}));
// Updated StyledListItemButton
const StyledListItemButton = styled(ListItemButton)(
  ({ isactive, collapsed }) => ({
    margin: "4px 8px",  // Add horizontal margin
    padding: collapsed ? "12px 8px" : "12px 16px", // Increase padding all around
    borderRadius: 8,
    transition: "all 0.25s ease",
    position: "relative",
    overflow: "hidden",
    backgroundColor: isactive === "true" ? "#f5f5f5" : "transparent",
    color: "#191919",
    fontWeight: isactive === "true" ? 600 : 400,
    display: "flex",
    justifyContent: collapsed ? "center" : "flex-start",
    width: "calc(100% - 16px)", // Adjust width to account for margins
    "&:hover": {
      backgroundColor: "#eeeeee",
      color: "#191919",
    },
  })
);

// Updated StyledListItemIcon
const StyledListItemIcon = styled(ListItemIcon)(({ isactive, collapsed }) => ({
  minWidth: collapsed ? 0 : 48,
  display: "flex",
  justifyContent: "center",
  margin: collapsed ? "0 auto" : "0",
  "& .MuiSvgIcon-root, & svg": {
    fontSize: "1.4rem",
    transition: "color 0.2s ease",
    color: isactive === "true" ? "#191919" : "#666", // <-- Fix here
  },
}));

// Add the missing StyledBottomListItemIcon component
const StyledBottomListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 0,
  display: "flex",
  justifyContent: "center",
  margin: "0",
  "& .MuiSvgIcon-root, & svg": {
    fontSize: "1.3rem",
    transition: "color 0.2s ease",
    color: "#666",
  },
}));

// Updated StyledListItemText
const StyledListItemText = styled(ListItemText)(({ isactive }) => ({
  margin: 0,
  paddingLeft: 8,
  "& .MuiTypography-root": {
    fontSize: "0.95rem",
    fontWeight: isactive === "true" ? 600 : 400,
    letterSpacing: 0.2,
    color: "#191919", // Using --textColor
  },
}));

// Update the styles object
const styles = {
  drawer: {
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      boxSizing: "border-box",
      padding: "8px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      borderRight: "1px solid #e0e0e0",
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.05)",
      background: "#ffffff",
      color: "#191919", // Using --textColor
      overflowX: "hidden",
      transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
  // Mobile-specific styles - Fixed positioning
  mobileMenuContainer: {
    display: "none",
    "@media (max-width: 898px)": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "fixed",
      top: 12, // Adjusted to align better with navbar
      left: 12, // Ensure it's on the left
      zIndex: 1300, // Lower than AppBar to prevent conflicts
      width: 40,
      height: 40,
      backgroundColor: "#ffffff", // Changed from #242526
      borderRadius: "50%",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Lighter shadow
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "scale(1.05)",
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  mobileMenuButton: {
    color: "#191919", // Changed from #e4e6eb to match other icons
    padding: "6px",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)", // Lighter hover effect
    },
  },
  mobileToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 8px",
    "@media (min-width: 898px)": {
      justifyContent: "center",
    },
  },
  closeButton: {
    display: "none",
    "@media (max-width: 898px)": {
      display: "flex",
      color: "#333",
      padding: "8px",
      marginRight: "4px",
      "&:hover": {
        backgroundColor: "rgba(0, 70, 246, 0.1)",
      },
    },
  },
  mobileDrawer: {
    "@media (max-width: 898px)": {
      "& .MuiDrawer-paper": {
        width: "280px",
        maxWidth: "80vw",
        padding: "12px",
      },
    },
  },
};

// 1. First, import MenuItem with an alias to avoid conflicts
import { MenuItem as MuiMenuItem } from "@mui/material";
import LocationModal from "./LocationModal";


// 2. Fix the MenuItem component definition by accepting collapsed as a prop with default value
const MenuItem = React.memo(
  ({
    item,
    isActive,
    isParentActive,
    onClick,
    collapsed = false,
    navigate,
    openParent,
    setOpenParent,
  }) => {
    // Only open if this parent is the open one
    const open = openParent === item.label;

    const handleMainClick = (e) => {
      if (item.subItems) {
        // Toggle open/close for this parent
        setOpenParent && setOpenParent(open ? null : item.label);
        if (item.subItems.length > 0 && item.subItems[0].path) {
          onClick && onClick();
          navigate(item.subItems[0].path);
        }
      } else {
        // Only close parent if this is a main menu item (not a subItem)
        setOpenParent && setOpenParent(null);
        onClick && onClick();
      }
    };

    // Determine if this item should be active
    const active = isActive(item.path) || isParentActive;

    return (
      <>
        <ListItem disablePadding sx={{ mb: 0.2, px: 0.5 }}>
          <StyledListItemButton
            component={item.subItems ? "div" : Link} // Changed: Only use div if subItems exist
            to={item.subItems ? undefined : item.path} // Changed: Only use undefined if subItems exist
            onClick={handleMainClick}
            isactive={active ? "true" : "false"}
            collapsed={collapsed ? "true" : "false"}
          >
            <StyledListItemIcon
              isactive={active ? "true" : "false"}
              collapsed={collapsed ? "true" : "false"}
            >
              {item.icon &&
                (active
                  ? React.createElement(item.activeIcon, { color: "#191919" })
                  : React.createElement(item.icon, { color: "#666" }))}
            </StyledListItemIcon>
            {!collapsed && (
              <>
                <StyledListItemText
                  primary={item.label}
                  isactive={active ? "true" : "false"}
                  sx={{ ml: 1 }}
                />
                {item.subItems && (
                  <ChevronRight
                    style={{
                      transform: open ? "rotate(90deg)" : "none",
                      transition: "transform 0.3s",
                      cursor: "pointer",
                    }}
                  />
                )}
              </>
            )}
          </StyledListItemButton>
        </ListItem>

        {item.subItems && open && !collapsed && (
          <Box sx={{ pl: 3, pr: 1, mt: 0.5, mb: 0.5 }}>
            {item.subItems.map((subItem) => (
              <MenuItem
                key={subItem.path}
                item={subItem}
                isActive={isActive}
                onClick={onClick}
                collapsed={collapsed}
                navigate={navigate}
              // Do NOT pass openParent or setOpenParent to subItems
              />
            ))}
          </Box>
        )}
      </>
    );
  }
);

export default function Sidebar({ drawerWidth = 260, openParent, setOpenParent }) {
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [collapsed, setCollapsed] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  // const [openParent, setOpenParent] = useState(null);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:768px)");

  useEffect(() => {
    // Simulate loading state for a smoother transition
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Update the isActive function to handle Assets paths
  const isActive = useCallback(
    (path) => {
      // Special case for Assets - should be active for both /assets and /assign-assets
      if (path === "/assign-assets") {
        return location.pathname === "/assets" || location.pathname === "/assign-assets";
      }
      return location.pathname === path;
    },
    [location.pathname]
  );

  // Also update the isParentActive function for consistency
  const isParentActive = useCallback(
    (item) => {
      // Special case for Assets menu item
      if (item.path === "/assign-assets") {
        return location.pathname === "/assets" || location.pathname === "/assign-assets";
      }

      return item.subItems &&
        item.subItems.some((sub) => isActive(sub.path));
    },
    [isActive, location.pathname]
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuItemClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  const renderSkeletons = useMemo(
    () =>
      Array.from(new Array(6)).map((_, index) => (
        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
          <StyledListItemButton>
            <StyledListItemIcon>
              <Skeleton variant="circular" width={28} height={28} />
            </StyledListItemIcon>
            <StyledListItemText
              primary={<Skeleton variant="text" width={150} height={24} />}
            />
          </StyledListItemButton>
        </ListItem>
      )),
    []
  );

  // Get logged-in user from localStorage
  const loggedInUser = useMemo(() => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // Skip the features API call for super-admin users
  const isSuperAdmin = loggedInUser?.role === "super-admin";

  // Get organization name
  const organizationName = useMemo(() => {
    return loggedInUser?.organization?.name || "Organization";
  }, [loggedInUser]);

  // Remove Notification from menuItems for all roles
  const filteredMenuItems = useMemo(() => {
    let roleBasedItems = [];

    // Find the Upload Document menu item
    const uploadDocumentItem = menuItems.find((item) => item.label === "Upload Document");

    if (loggedInUser?.role === "user") {
      roleBasedItems = menuItems.filter(
        (item) =>
          item.label === "Users" ||
          item.label === "Dashboard" ||
          item.label === "Attendance" ||
          item.label === "Reports"
      );
    } else if (loggedInUser?.role === "super-admin") {
      // Only show Organization and Org User List menu for super-admin
      roleBasedItems = menuItems.filter(
        (item) =>
          item.label === "Organization" || item.label === "Org User List"
      );
    } else {
      // For admin/hr, allow "Users" and other admin features
      roleBasedItems = menuItems.filter(
        (item) =>
          item.label !== "Organization" &&
          item.label !== "Notification" &&
          item.label !== "Org User List"
      );
    }

    // Feature-based filtering removed

    return roleBasedItems;
  }, [loggedInUser]);

  const renderMenuItems = useMemo(
    () =>
      filteredMenuItems.map((item) => (
        <MenuItem
          key={item.path}
          item={item}
          isActive={isActive}
          isParentActive={isParentActive(item)}
          onClick={handleMenuItemClick}
          collapsed={collapsed}
          navigate={navigate}
          openParent={openParent}
          setOpenParent={setOpenParent}
        />
      )),
    [filteredMenuItems, isActive, handleMenuItemClick]
  );

  // Add styled bottom actions
  const BottomActionsWrapper = styled(Box)(({ theme }) => ({
    width: "100%",
    padding: theme.spacing(0.5), // match dashboard padding
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",

    background: "transparent",
  }));

  // Update SideBySideActions styling to be responsive to collapsed state and button count
  const SideBySideActions = styled(Box)(({ theme, collapsed, isuser }) => ({
    display: "flex",
    flexDirection: collapsed ? "column" : "row", // Use column when collapsed, row otherwise
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    justifyContent: collapsed ? "center" : "space-between", // Center items when in column
    // When user role (2 buttons), make them take full width equally
    "& > *": {
      flex: isuser === "true" && !collapsed ? 1 : "0 0 30%", // Full width for 2 buttons, 30% for 3 buttons
    },
  }));

  const StyledBottomListItemButton = styled(ListItemButton)(({ theme }) => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center", // Center the icon
    borderRadius: 8,
    background: "#f5f5f5",
    color: "#191919",
    fontWeight: 500,
    fontSize: "1rem",
    minHeight: 44,
    transition: "background 0.2s, box-shadow 0.2s",
    boxShadow: "none",
    "&:hover": {
      background: "#eeeeee",
      color: "#191919",
    },
    padding: "0 8px",
  }));

  // Update LogoutButton with monochrome style
  const StyledLogoutButton = styled(ListItemButton)(({ theme }) => ({
    width: "100%",
    marginTop: theme.spacing(0.5),
    borderRadius: 8,
    background: "#f5f5f5",
    color: "#191919",
    fontWeight: 600,
    border: "1px solid #e0e0e0",
    minHeight: 44,
    justifyContent: "center",
    "&:hover": {
      background: "#eeeeee",
      color: "#191919",
    },
  }));

  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Location modal handlers
  const handleLocationModalOpen = () => {
    setLocationModal(true);
  };

  const handleLocationModalClose = () => {
    setLocationModal(false);
    // Don't clear form data if location data exists - let it remain pre-filled for next opening
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

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Get the current user's role to determine if they can set location
  const isAdminRole =
    loggedInUser?.role === "admin" || loggedInUser?.role === "hr";
  const { data: locationData, isLoading: isLocationLoading } =
    useGetLocationQuery(undefined, {
      skip: !isAdminRole, // Only fetch for admin/hr users
    });

  // Add this useEffect to pre-fill form data
  useEffect(() => {
    // Only set form data if locationData.data has all three required values and they are numbers
    if (
      locationData?.data &&
      typeof locationData.data.allowedLatitude === "number" &&
      typeof locationData.data.allowedLongitude === "number" &&
      typeof locationData.data.allowedRadius === "number"
    ) {
      // Parse punchOutHour
      let punchOutHour = "",
        punchOutMinute = "",
        punchOutPeriod = "PM";
      if (locationData.data.punchOutTime) {
        const [time, per] = locationData.data.punchOutTime.split(" ");
        [punchOutHour, punchOutMinute] = time.split(":");
        punchOutPeriod = per || "PM";
      }
      // Parse missingPunchOutHour
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
    }
  }, [locationData]);

  // Add this for the API call
  const [setLocationMutation, { isLoading: isSettingLocation }] =
    useSetLocationMutation();

  // Update the existing drawerContent to include collapse functionality
  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        
      }}
    >
      <Box>
        <DrawerHeader>
          <LogoWrapper
            collapsed={collapsed}
            onClick={() => {
              navigate("/dashboard");
              if (isMobile) setMobileOpen(false);
            }}
          > 
              <>
             <Box
                    sx={{
                      maxWidth: { xs: 15, sm: 25, md: 25 },  
                      maxHeight: 32,
                      display: "flex",
                      alignItems: "center",
                      ml: 1.5,
                    }}
                  >
                    <img
                      src={"/public/favicon.ico"}
                      alt={"Crypto"}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                {!collapsed && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      ml: 1,
                      fontWeight: 600,
                      color: "#191919",
                      whiteSpace: "nowrap",
                      fontSize: "0.95rem",
                    }}
                  >
                    {"Crypto"}
                  </Typography>
                )}
              </>
          </LogoWrapper>

          <IconButton
            onClick={() => {
              if (isMobile) {
                setMobileOpen(false); // Close drawer on mobile
              } else {
                setCollapsed(!collapsed); // Toggle collapse on desktop
              }
            }}
            sx={{
              color: "#191919",
              transition: "transform 0.3s ease-in-out",
              transform: isMobile
                ? "none"
                : collapsed
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
            }}
            aria-label={
              isMobile
                ? "close menu"
                : collapsed
                  ? "expand menu"
                  : "collapse menu"
            }
          >
            {isMobile ? (
              <ChevronLeft />
            ) : collapsed ? (
              <MenuIcon />
            ) : (
              <ChevronLeft />
            )}
          </IconButton>
        </DrawerHeader>

        <Divider sx={{ mb: 2 }} />

        {/* Main Navigation */}
        <List sx={{ px: 0.5, mt: 1 }}>
          {loading
            ? renderSkeletons
            : filteredMenuItems.map((item) => (
              <MenuItem
                key={item.path}
                item={item}
                isActive={isActive}
                isParentActive={isParentActive(item)}
                onClick={handleMenuItemClick}
                collapsed={collapsed}
                navigate={navigate}
                openParent={openParent}
                setOpenParent={setOpenParent}
              />
            ))}
        </List>
      </Box>

      {/* Bottom actions removed */}
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Mobile Menu Button */}
      {!mobileOpen && (
        <Box sx={styles.mobileMenuContainer}>
          <IconButton
            sx={{
              ...styles.mobileMenuButton,
              color: "#191919", // Changed from #e4e6eb to match other icons
            }}
            onClick={handleDrawerToggle}
            aria-label="open menu"
          >
            <MenuIcon sx={{ fontSize: 24, color: "#191919" }} />
          </IconButton>
        </Box>
      )}

      {/* Desktop/Tablet Drawer - now with collapsible width */}
      <Drawer
        sx={{
          width: collapsed ? 64 : drawerWidth,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: collapsed ? 64 : drawerWidth,
            minWidth: collapsed ? 64 : 220,
            maxWidth: collapsed ? 64 : 280,
            boxSizing: "border-box",
            borderRadius: 0,
            backgroundColor: "#ffffff",
            borderRight: "1px solid #e0e0e0",
            transition: "all 0.3s ease-in-out", // Smooth transition
            "& .MuiListItemIcon-root": {
              transition: "margin 0.3s ease-in-out", // Smooth icon transition
              color: "#191919",
            },
            "& .MuiTypography-root": {
              transition: "opacity 0.3s ease-in-out", // Smooth text transition
              color: "#191919",
              opacity: collapsed ? 0 : 1,
            },
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer - keep as is but update styling */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 240,
            minWidth: 200,
            maxWidth: 320,
            boxSizing: "border-box",
            borderRadius: "0px 16px 16px 0px",
            backgroundColor: "#ffffff", // Changed to white
            color: "#191919", // Changed to dark text
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            "& .MuiListItemIcon-root": {
              color: "#191919", // Match desktop icon color
            },
            "& .MuiTypography-root": {
              color: "#191919", // Match desktop text color
            },
            "& .MuiListItemButton-root:hover": {
              backgroundColor: "#eeeeee", // Match desktop hover color
            },
            boxShadow: "0 0 20px rgba(0,0,0,0.1)", // Add subtle shadow for mobile
          },
        }}
      >
        {drawerContent}
      </Drawer>

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
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
