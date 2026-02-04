import React, { useState, useEffect } from "react";

import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Stack,
  Snackbar,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Avatar,
  useTheme,
} from "@mui/material";
import {
  CalendarClock,
  UserCheck,
  UserX,
  Calendar,
  AlertCircle,
  ClipboardList,
  UserMinus,
  FileX,
  CalendarX,
  ClipboardX,
  MessageSquare,
  Icon,
  Cake,
  CalendarHeart,
  Gift,
  Users,
  Package,
  ShoppingCart,
} from "lucide-react";
import {
  useUpdateLeaveStatusMutation,
  usePunchInMutation,
  usePunchOutMutation,
  useUpdateWorkFromHomeStatusMutation,
  useUpdatePunchCorrectionStatusMutation,
  useGetDealersQuery,
  useGetTallyProductsQuery,
  useGetTallyOrdersQuery,
} from "../apiService";
import { CustomLoader, LoaderContainer } from "./Layout/CustomLoader";
import { ConfirmationDialog } from "./Layout/ConfirmationDialog";

import { Check, Close } from "@mui/icons-material";
import { useAuth } from "../utils/AuthContext";
import { X } from "lucide-react";

const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

function NoDataMessage({ icon: Icon, message }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        gap: 1,
        paddingTop: 6,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1.5,
          opacity: 0.8,
        }}
      >
        <Icon size={24} color="#757575" />
      </Box>
      <Typography variant="body2" color="text.secondary" align="center">
        {message}
      </Typography>
    </Box>
  );
}

function StatusChip({ status }) {
  let chipProps = { label: status, size: "small" };
  if (status === "Punch-In") {
    chipProps = {
      ...chipProps,
      sx: {
        bgcolor: "var(--successBgColor)",
        color: "var(--successTextColor)",
        fontWeight: 600,
        borderRadius: "10px",
        px: 2,
        py: 0.5,
        fontSize: "0.95em",
        minWidth: 70,
        textAlign: "center",
        textTransform: "capitalize",
      },
    };
  } else if (status === "Punch-Out") {
    chipProps = {
      ...chipProps,
      sx: {
        bgcolor: "var(--yellowShadeBg)",
        color: "var(--yellowShadeColor)",
        fontWeight: 600,
        borderRadius: "10px",
        px: 2,
        py: 0.5,
        fontSize: "0.95em",
        minWidth: 70,
        textAlign: "center",
        textTransform: "capitalize",
      },
    };
  } else if (status === "Absent") {
    chipProps = {
      ...chipProps,
      sx: {
        bgcolor: "var(--redShadeBg)",
        color: "var(--redShadeColor)",
        fontWeight: 600,
        borderRadius: "10px",
        px: 2,
        py: 0.5,
        fontSize: "0.95em",
        minWidth: 70,
        textAlign: "center",
        textTransform: "capitalize",
      },
    };
  } else {
    chipProps = {
      ...chipProps,
      sx: {
        bgcolor: "#e5e7eb",
        color: "#191919",
        fontWeight: 600,
        borderRadius: "10px",
        px: 2,
        py: 0.5,
        fontSize: "0.95em",
        minWidth: 70,
        textAlign: "center",
        textTransform: "capitalize",
      },
    };
  }
  return <Chip {...chipProps} />;
}

function Home() {
  // Get loggedInUser from localStorage
  const loggedInUser = React.useMemo(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }, []);

  // Extract role and userId from loggedInUser
  const role = loggedInUser?.role;
  const userId = loggedInUser?._id;

  const { triggerPunch, punchEvent } = useAuth();

  // API calls for counts
  const { data: dealersData, isLoading: dealersLoading } = useGetDealersQuery({ 
    page: 0, 
    limit: 0
  });
  
  const { data: productsData, isLoading: productsLoading } = useGetTallyProductsQuery({ 
    page: 0, 
    limit: 0 
  });
  
  const { data: ordersData, isLoading: ordersLoading } = useGetTallyOrdersQuery({ 
    page: 0, 
    limit: 0,
    event: "fetch_sales" 
  });

  // Extract counts from API responses
  const dealerCount = dealersData?.totalCount || 0;
  const productCount = productsData?.totalCount || 0;
  const orderCount = ordersData?.totalCount || 0;

  // Dummy data for dashboard info (keep existing data for other sections)
  const dummyDashboardData = {
    responseData: {
      // For user role
      todaysWorkingHours: "7:30",
      monthlyWorkingHours: "120:00",
      currentMonthLeaveDays: 2,
      monthlyAttendance: [
        { date: "2025-10-01", punchIn: "09:00", punchOut: "17:00", workingHours: "8:00", isWorkFromHome: false },
        { date: "2025-10-02", punchIn: "09:15", punchOut: "17:10", workingHours: "7:55", isWorkFromHome: true },
      ],
      leaves: [
        { leaveType: "Sick", startDate: "2025-10-05", endDate: "2025-10-05", status: "approved" },
      ],
      yearlyLeaves: [
        { leaveType: "Casual", startDate: "2025-01-10", endDate: "2025-01-12", status: "approved", id: 1 },
        { leaveType: "Sick", startDate: "2025-03-15", endDate: "2025-03-15", status: "rejected", id: 2 },
      ],
      // For admin role
      punchIn: 12,
      onLeave: 3,
      notPunchIn: 2,
      todaysAttendance: [
        { name: "Alice", status: "Punch-In", time: "09:05", isWorkFromHome: false },
        { name: "Bob", status: "Punch-Out", time: "17:00", isWorkFromHome: true },
      ],
      todaysLeaves: [
        { name: "Charlie", halfDay: "Full-day", leaveType: "Sick" },
      ],
      upcomingLeaves: [
        { name: "David", startDate: "2025-10-20", endDate: "2025-10-22", leaveType: "Casual" },
      ],
      pendingLeaves: [
        { id: 101, name: "Eve", leaveType: "Casual", startDate: "2025-10-18", endDate: "2025-10-18", reason: "Family event", status: "pending" },
      ],
      userName: "John Doe",
    },
  };

  // Dummy data for pending WFH requests
  const dummyPendingWfhRequests = [
    { _id: "wfh1", userName: "Frank", type: "wfh", date: "2025-10-17", reason: "Internet issue", status: "pending" },
  ];

  // Dummy data for pending punchout correction requests
  const dummyPendingPunchoutRequests = [
    { id: "pc1", name: "Grace", type: "punchCorrection", correctionType: "punch-in", requestedTime: "09:30", reason: "Forgot to punch in", status: "pending", createdAt: "2025-10-18" },
  ];

  // Use dummy data instead of API for other sections
  const data = dummyDashboardData;
  const isLoading = dealersLoading || productsLoading || ordersLoading;
  const refetch = () => {};
  const pendingLeaves = data?.responseData?.pendingLeaves || [];
  const pendingWfhRequests = dummyPendingWfhRequests;
  const pendingPunchoutRequests = dummyPendingPunchoutRequests;
  const allPendingRequests = [
    ...pendingLeaves.map((l) => ({ ...l, type: "leave" })),
    ...pendingWfhRequests.map((w) => ({ ...w, type: "wfh" })),
    ...pendingPunchoutRequests,
  ];

  // Refetch dashboard info when punchEvent changes
  React.useEffect(() => {
    if (punchEvent > 0) {
      refetch();
    }
  }, [punchEvent, refetch]);

  const [updateLeaveStatus] = useUpdateLeaveStatusMutation();
  const [punchIn] = usePunchInMutation();
  const [punchOut] = usePunchOutMutation();
  const [updateWorkFromHomeStatus] = useUpdateWorkFromHomeStatusMutation();
  const [updatePunchCorrectionStatus] =
    useUpdatePunchCorrectionStatusMutation();
  const [selectedWfh, setSelectedWfh] = useState(null);
  const [selectedPunchout, setSelectedPunchout] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [loading, setLoading] = useState(false);

  const handleLeaveAction = async (leaveId, status) => {
    setSelectedLeave(leaveId);
    setActionType(status);
    setDialogOpen(true);
  };
  const handleWfhAction = (wfhId, status) => {
    setSelectedWfh({ wfhId, status });
    setActionType(status);
    setDialogOpen(true);
  };
  const handlePunchIn = async () => {
    try {
      const result = await punchIn().unwrap();
      if (result.success) {
        triggerPunch();
      }
    } catch (e) {
      // handle error
    }
  };

  const handlePunchOut = async () => {
    try {
      const result = await punchOut().unwrap();
      if (result.success) {
        triggerPunch();
      }
    } catch (e) {
      // handle error
    }
  };

  if (isLoading) {
    return (
      <LoaderContainer>
        <CustomLoader color="#7267f0" />
      </LoaderContainer>
    );
  }

  // For user role, get values from responseData
  const userStats = {
    checkedIn: data?.responseData?.todaysWorkingHours || "-",
    onLeave: data?.responseData?.monthlyWorkingHours || "-",
    notCheckedIn: data?.responseData?.currentMonthLeaveDays ?? "-",
  };
  const adminStats = {
    checkedIn: dealerCount,
    onLeave: productCount,
    notCheckedIn: orderCount,
  };
  const stats = role === "user" ? userStats : adminStats;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateDMY = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleConfirmAction = async (comment) => {
    setLoading(true);
    try {
      let response;
      if (selectedWfh) {
        response = await updateWorkFromHomeStatus({
          wfhId: selectedWfh.wfhId,
          status: actionType,
          reason: comment,
        }).unwrap();
        setSnackbar({
          open: true,
          message: response.message || "WFH status updated.",
          severity: "success",
        });
        setSelectedWfh(null);
      } else if (selectedPunchout) {
        response = await updatePunchCorrectionStatus({
          requestId: selectedPunchout.id,
          status: actionType,
          adminComment: comment,
        }).unwrap();
        setSnackbar({
          open: true,
          message:
            response?.responseMessage ||
            response?.message ||
            `Correction ${actionType}.`,
          severity: actionType === "approved" ? "success" : "error",
        });
        setSelectedPunchout(null);
        if (typeof refetch === "function") refetch();
      } else {
        response = await updateLeaveStatus({
          leaveId: selectedLeave,
          status: actionType,
          comment,
        }).unwrap();

        if (
          response?.responseData?.notification?.type === "leaveStatusUpdate" &&
          response?.responseData?.notification?.message
        ) {
          setSnackbar({
            open: true,
            message: response.responseData.notification.message,
            severity: "success",
          });
        } else {
          setSnackbar({
            open: true,
            message: response.responseMessage,
            severity: "success",
          });
        }

        if (typeof refetch === "function") refetch();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error?.data?.message || error?.message || "Failed to update status",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setDialogOpen(false);
      setSelectedLeave(null);
      setActionType(null);
      setSelectedWfh(null);
      setSelectedPunchout(null);
    }
  };

  const renderMonthlyAttendance = () => (
    <Box sx={{ overflow: "auto", flex: 1 }}>
      {data?.responseData?.monthlyAttendance?.length > 0 ? (
        <Stack spacing={1}>
          {data.responseData.monthlyAttendance.map((att, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: "10px 16px",
                borderRadius: "10px",
                bgcolor: "#f5f5f5",
                minHeight: "44px",
                color: "var(--textColor)",
                fontWeight: 500,
                fontSize: "0.98rem",
                borderBottom: "1px solid #e5e7eb",
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  minWidth: 110,
                  color: "var(--textColor)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {formatDate(att.date)}
                {att.isWorkFromHome && (
                  <span
                    style={{
                      marginLeft: 8,
                      padding: "2px 8px",
                      backgroundColor: "var(--backgroundColor, #EFEFEF)",
                      color: "var(--textColor, #191919)",
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      display: "inline-block",
                      height: 22,
                      verticalAlign: "middle",
                    }}
                  >
                    WFH
                  </span>
                )}
              </Typography>
              <Typography
                variant="body2"
                sx={{ minWidth: 100, color: "var(--textColor)" }}
              >
                In: {att.punchIn || "-"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ minWidth: 100, color: "var(--textColor)" }}
              >
                Out: {att.punchOut || "-"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ minWidth: 80, color: "var(--textColor)" }}
              >
                {att.workingHours}
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <NoDataMessage
          icon={UserMinus}
          message="No monthly attendance records available"
        />
      )}
    </Box>
  );

  // Helper for user monthly leaves
  const renderMonthlyLeaves = () => (
    <Box sx={{ overflow: "auto", flex: 1 }}>
      {data?.responseData?.leaves?.length > 0 ? (
        <Stack spacing={2}>
          {data.responseData.leaves.map((leave, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                bgcolor: "#f5f5f5",
                borderRadius: 1,
                "&:hover": { bgcolor: "#eeeeee" },
              }}
            >
              <Typography variant="body2">{leave.leaveType}</Typography>
              <Typography variant="body2">
                {formatDate(leave.startDate)}
                {leave.endDate && leave.endDate !== leave.startDate
                  ? ` - ${formatDate(leave.endDate)}`
                  : ""}
              </Typography>
              <Typography variant="body2">{leave.status}</Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <NoDataMessage
          icon={FileX}
          message="No leaves recorded for this month"
        />
      )}
    </Box>
  );

  // Update the renderYearlyLeaves function for better styling
  const renderYearlyLeaves = () => (
    <Box sx={{ overflow: "auto", flex: 1, p: 1 }}>
      {data?.responseData?.yearlyLeaves?.length > 0 ? (
        <Stack spacing={1.2}>
          {data.responseData.yearlyLeaves.map((leave, idx) => (
            <Box
              key={leave.id || idx}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: "10px 16px",
                bgcolor: "#ffffff",
                borderRadius: "10px",
                minHeight: "44px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#f9fafb",
                  borderColor: "#d1d5db",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                },
                gap: 2,
              }}
            >
              <Box sx={{ minWidth: 110 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#111827" }}
                >
                  {leave.leaveType}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", fontSize: "12px" }}
                >
                  {leave.startDate === leave.endDate
                    ? formatDate(leave.startDate)
                    : `${formatDate(leave.startDate)} - ${formatDate(
                      leave.endDate
                    )}`}
                </Typography>
              </Box>

              <StatusBadge status={leave.status?.toLowerCase()}>
                {leave.status?.toLowerCase()}
              </StatusBadge>
            </Box>
          ))}
        </Stack>
      ) : (
        <NoDataMessage
          icon={FileX}
          message="No leaves recorded for this year"
        />
      )}
    </Box>
  );

  const renderPendingLeaveRequests = () => (
    <Box sx={{ overflow: "auto", flex: 1, p: 1 }}>
      {allPendingRequests.length > 0 ? (
        <Stack spacing={2}>
          {allPendingRequests.map((req, index) => (
            <Paper
              key={req._id || req.id || index}
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#f9fafb",
                  borderColor: "#d1d5db",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                {/* Left content column */}
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  {/* Name and Type */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#111827",
                      }}
                    >
                      {req.name || req.userName || req.userId?.name || "User"}
                    </Typography>
                    <Chip
                      label={
                        req.type === "wfh"
                          ? "Work From Home"
                          : req.type === "punchCorrection"
                            ? req.correctionType === "punch-in"
                              ? "Punch-In Correction"
                              : "Punch-Out Correction"
                            : req.leaveType
                      }
                      size="small"
                      color={
                        req.type === "wfh"
                          ? "secondary"
                          : req.type === "punchCorrection"
                            ? req.correctionType === "punch-in"
                              ? "info"
                              : "warning"
                            : "primary"
                      }
                      variant="outlined"
                      sx={{ fontSize: "12px", height: 22 }}
                    />
                  </Box>

                  {/* Date or Time */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Calendar size={14} />
                    <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                      {req.type === "punchCorrection"
                        ? `Requested Time: ${req.requestedTime}`
                        : req.startDate === req.endDate
                          ? formatDateDMY(req.startDate)
                          : `${formatDateDMY(req.startDate)} - ${formatDateDMY(
                            req.endDate
                          )}`}
                    </Typography>
                  </Box>

                  {/* Reason (if provided) */}
                  {req.reason && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <MessageSquare size={14} />
                      <Tooltip title={req.reason} arrow placement="top">
                        <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                          {truncateText(req.reason, 15)}
                        </Typography>
                      </Tooltip>
                    </Box>
                  )}
                </Box>

                {/* Action buttons */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (req.type === "wfh") {
                        handleWfhAction(req._id, "approved");
                      } else if (req.type === "punchCorrection") {
                        setSelectedPunchout(req);
                        setActionType("approved");
                        setDialogOpen(true);
                      } else {
                        handleLeaveAction(req.id, "approved");
                      }
                    }}
                    sx={{
                      color: "success.main",
                      height: "32px",
                      width: "32px",
                      borderRadius: "50%",
                      border: "1px solid",
                      borderColor: "success.main",
                      "&:hover": {
                        bgcolor: "success.main",
                        color: "#ffffff",
                      },
                    }}
                  >
                    <Check fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (req.type === "wfh") {
                        handleWfhAction(req._id, "rejected");
                      } else if (req.type === "punchout") {
                        setSelectedPunchout(req);
                        setActionType("rejected");
                        setDialogOpen(true);
                      } else {
                        handleLeaveAction(req.id, "rejected");
                      }
                    }}
                    sx={{
                      color: "error.main",
                      height: "32px",
                      width: "32px",
                      borderRadius: "50%",
                      border: "1px solid",
                      borderColor: "error.main",
                      "&:hover": {
                        bgcolor: "error.light",
                        color: "#ffffff",
                      },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>
      ) : (
        <NoDataMessage
          icon={ClipboardX}
          message="No pending leave, WFH, or punch-out requests available"
        />
      )}
    </Box>
  );

  // Add userName for display
  const userName = loggedInUser?.userName || data?.responseData?.userName || "";

  return (
    <Box
      sx={{
        pt: "2rem",
        width: "100%",
      }}
    >
      {/* Header with name on right */}

      <Grid container spacing={3} mb={3} sx={{ width: "100%", mx: "-12px"}}>
        {/* First Card - Dealers */}
        <Grid item xs={12} sm={6} md={4} sx={{ pl: 0 }}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: "blue",
              color: "white",
              borderRadius: 2,
              boxShadow: "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{ color: "white" }}
                >
                  {stats.checkedIn}
                </Typography>
                <Typography sx={{ color: "white" }}>
                  {role === "user" ? "Today's Working Hours" : "Total Dealers"}
                </Typography>
              </Box>
              {role === "user" ? (
                <UserCheck size={48} color="#fff" />
              ) : (
                <Users size={48} color="#fff" />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Second Card - Products */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: "blue",
              color: "white",
              borderRadius: 2,
              boxShadow: "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{ color: "white" }}
                >
                  {stats.onLeave}
                </Typography>
                <Typography sx={{ color: "white" }}>
                  {role === "user" ? "Monthly Working Hours" : "Total Products"}
                </Typography>
              </Box>
              {role === "user" ? (
                <UserX size={48} color="#fff" />
              ) : (
                <Package size={48} color="#fff" />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Third Card - Orders */}
        <Grid item xs={12} sm={6} md={4} sx={{ pr: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: "blue",
              color: "white",
              borderRadius: 2,
              boxShadow: "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{ color: "white" }}
                >
                  {stats.notCheckedIn}
                </Typography>
                <Typography sx={{ color: "white" }}>
                  {role === "user"
                    ? "Current Month Leave Days"
                    : "Total Orders"}
                </Typography>
              </Box>
              {role === "user" ? (
                <AlertCircle size={48} color="#fff" />
              ) : (
                <ShoppingCart size={48} color="#fff" />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Rest of the existing code remains the same... */}
      {/* Second Row - Attendance/Leaves */}
      <Grid container spacing={3} mb={3} sx={{ width: "100%", mx: "-12px"}}>
        {/* Recent Activity Card */}
        <Grid item xs={12} md={8} sx={{ pl: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "white",
              borderRadius: 2,
              height: "385px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
                pb: 2,
              }}
            >
              <CalendarClock size={24} style={{ color: "var(--textColor)" }} />
              <Typography
                variant="h5"
                fontWeight="bold"
                color="var(--textColor)"
                sx={{ fontSize: 22 }}
              >
                Recent Dealer Activities
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
              <NoDataMessage
                icon={UserMinus}
                message="No recent dealer activities available"
              />
            </Box>
          </Paper>
        </Grid>

        {/* System Status Card */}
        <Grid item xs={12} md={4} sx={{ pr: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "white",
              height: "385px",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <UserX size={24} style={{ color: "var(--textColor)" }} />
              <Typography
                variant="h6"
                fontWeight="bold"
                color="var(--textColor)"
                sx={{ fontSize: 22 }}
              >
                System Status
              </Typography>
            </Box>
            <Box sx={{ overflow: "hidden", flex: 1 }}>
              <Box sx={{ height: "100%", overflow: "auto", pr: 1 }}>
                <NoDataMessage
                  icon={FileX}
                  message="All systems operational"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Third Row - Only for admin */}
      {role === "admin" && (
        <Grid container spacing={3} sx={{ width: "100%", mx: "-12px"}}>
          {/* Quick Actions Card */}
          <Grid item xs={12} md={6} sx={{ pl: 0 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "white",
                height: "400px",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Calendar size={24} style={{ color: "var(--textColor)" }} />
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="var(--textColor)"
                  sx={{ fontSize: 22 }}
                >
                  Quick Actions
                </Typography>
              </Box>
              <Box sx={{ overflow: "auto", flex: 1 }}>
                <NoDataMessage
                  icon={CalendarX}
                  message="No quick actions available"
                />
              </Box>
            </Paper>
          </Grid>

          {/* Notifications Card */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "white",
                height: "400px",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <ClipboardList size={24} color="var(--textColor)" />
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="var(--textColor)"
                  sx={{ fontSize: 22 }}
                >
                  Notifications
                </Typography>
              </Box>
              <Box sx={{ overflow: "auto", flex: 1 }}>
                <NoDataMessage
                  icon={ClipboardX}
                  message="No new notifications"
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      <ConfirmationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmAction}
        title=""
        message=""
        confirmText={actionType === "approved" ? "Approve" : "Reject"}
        actionType={actionType}
        loading={loading}
        reqType={
          selectedWfh
            ? "wfh"
            : selectedPunchout
              ? "punchout"
              : selectedLeave
                ? "leave"
                : ""
        }
        date={
          selectedWfh?.date
            ? formatDateDMY(selectedWfh.date)
            : selectedPunchout?.createdAt
              ? formatDateDMY(selectedPunchout.createdAt)
              : allPendingRequests.find((r) => r.id === selectedLeave)?.startDate
                ? formatDateDMY(
                  allPendingRequests.find((r) => r.id === selectedLeave)
                    ?.startDate
                )
                : ""
        }
        requestedTime={selectedPunchout?.requestedTime}
        userName={
          selectedWfh?.userName ||
          selectedPunchout?.name ||
          allPendingRequests.find((r) => r.id === selectedLeave)?.name
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Home;

// Add this styled component near the top (with other styled components)
const StatusBadge = ({ status }) => (
  <Box
    sx={{
      padding: "6px 12px",
      borderRadius: 20,
      fontWeight: 500,
      display: "inline-block",
      backgroundColor:
        status === "approved"
          ? "var(--successBgColor)"
          : status === "rejected"
            ? "var(--redShadeBg)"
            : status === "pending"
              ? "var(--yellowShadeBg)"
              : "rgba(0,70,246,0.08)",
      color:
        status === "approved"
          ? "var(--successTextColor)"
          : status === "rejected"
            ? "var(--redShadeColor)"
            : status === "pending"
              ? "var(--yellowShadeColor)"
              : "#0046f6",
      textTransform: "lowercase",
      fontSize: "0.95em",
      minWidth: 70,
      textAlign: "center",
    }}
  >
    {status}
  </Box>
);