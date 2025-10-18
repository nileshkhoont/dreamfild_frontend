import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Search, Laptop, Calendar } from "lucide-react"; // Add Calendar here
import { FaRegUser } from "react-icons/fa"; // <-- Import icon
import { useGetWorkFromHomeListQuery, useUpdateWorkFromHomeStatusMutation } from "../../apiService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEmployee } from "../../utils/EmployeeContext";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import WorkFromHomeModal from "../Attendance/WorkFromHomeModal"; // Add this import
import { Check, Close } from "@mui/icons-material";
import { ConfirmationDialog } from "../Layout/ConfirmationDialog"; // Import if not already
import { CustomLoader, LoaderContainer } from "../Layout/CustomLoader";
const Container = styled(Box)({
  // maxWidth: 1400,
  margin: "0 auto",
  paddingTop: "0.1rem",
});


const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  border: "none",
  overflowX: "auto",
  // Remove fixed maxHeight, we'll handle it dynamically
  "& .MuiTableHead-root": {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: "var(--tableHeaderBackgroundColor)",
  },
  "& .MuiTableCell-head": {
    fontWeight: 600,
    color: "var(--textColor)",
    borderBottom: "none",
    whiteSpace: "nowrap",
    padding: theme.spacing(1.5),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
      fontSize: "0.875rem",
    },
  },
  "& .MuiTableCell-root": {
    borderBottom: "none",
    borderRight: "none",
    padding: theme.spacing(1.5),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
      fontSize: "0.875rem",
    },
  },
  "& .MuiTableRow-root:hover": {
    backgroundColor: "var(--hoverBackgroundColor)",
    transition: "background-color 0.3s ease",
  },
}));

const StatusBadge = styled(Box)(({ status }) => ({
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
}));

const WorkFromHome = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const { selectedEmployee } = useEmployee();

  // Get current user and role from localStorage
  const currentUser = React.useMemo(() => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }, []);
  const role = currentUser?.role;

  // Get org ID from localStorage
  const orgId = currentUser?.organization?._id || "";

  // If role is "user", always use their own ID for the query
  const queryParams = orgId
    ? role === "user"
      ? { organizationId: orgId, userId: currentUser._id }
      : selectedEmployee
        ? { organizationId: orgId, userId: selectedEmployee }
        : { organizationId: orgId }
    : null;

  // Fetch requests for selected employee or current user
  const {
    data,
    isLoading,
    error,
    refetch, // <-- Add refetch from RTK Query
  } = useGetWorkFromHomeListQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const users = data?.data?.requests || [];

  const getMonthStartEnd = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return [start, end];
  };

  const [dateRange, setDateRange] = React.useState(getMonthStartEnd());
  const [startDate, endDate] = dateRange;

  // Filter users based on search term and current month (Start Date only)
  const filteredUsers = React.useMemo(() => {
    let filtered = users;

    // Only filter by date if both startDate and endDate are set
    if (startDate && endDate) {
      filtered = filtered.filter((user) => {
        // Parse user.startDate (assumed format: dd-MM-yyyy)
        const [day, month, year] = user.startDate.split("-").map(Number);
        const userStart = new Date(year, month - 1, day);

        // Compare with selected range
        return userStart >= startDate && userStart <= endDate;
      });
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [users, searchTerm, startDate, endDate]);

  // Add a styled message for no users found
  const NoRecordsMessage = (
    <Box
      sx={{
        textAlign: "center",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: 200,
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
        <FaRegUser size={32} color="#757575" />
      </Box>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ textAlign: "center" }}
      >
        {selectedEmployee ? (
          <>No work from home records found for this employee.</>
        ) : (
          "No users found. Please select an employee to view work from home records."
        )}
      </Typography>
      {/* Refresh button removed */}
    </Box>
  );

  const [applyModalOpen, setApplyModalOpen] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [wfhReason, setWfhReason] = React.useState("");
  const [wfhDateRange, setWfhDateRange] = React.useState([null, null]);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedWfh, setSelectedWfh] = React.useState(null);
  const [actionType, setActionType] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Refetch data after successful WFH apply
  const handleApplyModalClose = () => {
    setApplyModalOpen(false);
    setSubmitted(false);
    setWfhReason("");
    setWfhDateRange([null, null]);
    refetch(); // <-- Refetch after modal closes
  };

  // Handler for approve/reject
  const handleWfhAction = (wfhId, status) => {
    setSelectedWfh({ wfhId, status });
    setActionType(status);
    setDialogOpen(true);
  };

  // Confirm dialog action
  const [updateWorkFromHomeStatus] = useUpdateWorkFromHomeStatusMutation();

  const handleConfirmAction = async (comment) => {
    setLoading(true);
    try {
      const res = await updateWorkFromHomeStatus({
        wfhId: selectedWfh.wfhId,
        status: actionType,
        reason: comment, // <-- Pass comment as reason
      }).unwrap();
      setSnackbar({
        open: true,
        message: res?.message || res?.responseMessage || `WFH status ${actionType}d successfully.`,
        severity: res?.statusCode === 200 ? "success" : "info",
      });
      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || error?.data?.responseMessage || "Failed to update status",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setDialogOpen(false);
      setSelectedWfh(null);
      setActionType(null);
    }
  };

  if (isLoading) {
    return (
      <LoaderContainer>
        <CustomLoader />
      </LoaderContainer>
    );
  }

  return (
    <Container>
      <Card
        sx={{
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          color: "var(--textColor)",
          pt: { xs: 0.9, md: 1.5, lg: 2 }, // Increase padding top for larger screens
          mt: { xs: 1, sm: 2, md: 3, lg: 4 }, // Add margin top that increases with screen size
          height: "calc(100vh - 130px)",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflow: "hidden", // Prevent content overflow
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Laptop size={22} style={{ marginRight: 6 }} />{" "}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "var(--textColor)",
                  textAlign: "left",
                  fontSize: { xs: "18px", sm: "20px", md: "22px" },
                }}
                component="span"
              >
                Remote Work Users
              </Typography>
            </Box>
          }
          sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}
        />
        <CardContent sx={{ flexGrow: 1, pb: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              mb: 2,
              mt: -2,
              width: "100%",
              gap: 2,
            }}
          >
            {/* Container for search and date picker */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                flex: 1,
                maxWidth: { xs: "100%", sm: "700px" },
                width: "100%"
              }}
            >
              {/* Search field */}
              <TextField
                placeholder="Search by name"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: "100%", sm: "250px" },
                  "& .MuiInputBase-root": {
                    fontSize: "14px",
                    borderRadius: "12px",
                    height: "40px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--textFieldBorderColor, #ced4da)",
                    borderRadius: "12px",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--textFieldBorderColor, #ced4da)",
                  },
                  "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                    borderWidth: 1,
                  },
                }}
              />

              {/* Date Picker */}
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                isClearable={true}
                placeholderText="Select date range"
                dateFormat="dd/MM/yyyy"
                popperProps={{
                  strategy: "fixed",
                  placement: "bottom-start",
                }}
                customInput={
                  <TextField
                    className="custom-textfield"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Calendar size={16} color="#666" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: { xs: "100%", sm: "250px" },
                      "& .MuiInputBase-root": {
                        fontSize: "14px",
                        borderRadius: "12px",
                        height: "40px",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--textFieldBorderColor, #ced4da)",
                        borderRadius: "12px",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--textFieldBorderColor, #ced4da)",
                      },
                      "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                        borderWidth: 1,
                      },
                    }}
                  />
                }
                calendarClassName="custom-datepicker-calendar"
                dayClassName={(date) => {
                  const isSelected =
                    startDate &&
                    endDate &&
                    date >= startDate &&
                    date <= endDate;
                  return isSelected
                    ? "custom-datepicker-selected"
                    : "custom-datepicker-day";
                }}
              />
            </Box>

            {/* Button always aligned to the right on desktop, centered on mobile */}
            {role === "user" && (
              <Button
                variant="contained"
                color="primary"
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
                  width: { xs: "100%", sm: "auto" },
                  minWidth: "120px",
                  alignSelf: { xs: "center", sm: "auto" },
                  whiteSpace: "nowrap",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "var(--purpleShadeBg)",
                    boxShadow: "none",
                  },
                }}
                onClick={() => setApplyModalOpen(true)}
              >
                Apply RW
              </Button>
            )}
          </Box>

          {filteredUsers.length === 0 ? (
            NoRecordsMessage
          ) : (
            <StyledTableContainer 
              component={Paper} 
              elevation={0}
              sx={{
                // Calculate height based on available space in the card
                height: "calc(100vh - 280px)", // Adjust this value based on your header/footer space
                maxHeight: "calc(100vh - 280px)",
                overflow: "hidden",
              }}
            >
              <Table sx={{ tableLayout: "auto", minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 120 }}>Name</TableCell>
                    <TableCell sx={{ minWidth: 150 }}>Email</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>Start Date</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>End Date</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>Reason</TableCell>
                    <TableCell sx={{ minWidth: 140 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
              </Table>
              {/* Scrollable container for TableBody */}
              <Box
                sx={{
                  // Calculate remaining height after header
                  height: "calc(100vh - 330px)", // Header height + padding adjustments
                  maxHeight: "calc(100vh - 330px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <Table>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Typography sx={{ fontWeight: 500, fontSize: { xs: "0.875rem", sm: "inherit" } }}>
                              {user.userName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: "0.875rem", sm: "inherit" } }}>{user.userEmail}</TableCell>
                        <TableCell sx={{ fontSize: { xs: "0.875rem", sm: "inherit" } }}>{user.startDate}</TableCell>
                        <TableCell sx={{ fontSize: { xs: "0.875rem", sm: "inherit" } }}>{user.endDate}</TableCell>
                        <TableCell sx={{ fontSize: { xs: "0.875rem", sm: "inherit" } }}>
                          <Tooltip title={user.reason || ""} arrow placement="top">
                            <span>
                              {user.reason && user.reason.length > 10
                                ? user.reason.slice(0, 10) + "..."
                                : user.reason}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ position: "relative" }}>
                          <StatusBadge status={user.status}>
                            {user.status}
                          </StatusBadge>
                          {user.status === "pending" && role === "admin" && (
                            <Box
                              sx={{
                                position: { xs: "static", sm: "absolute" },
                                right: 8,
                                top: "50%",
                                transform: { xs: "none", sm: "translateY(-50%)" },
                                display: "flex",
                                gap: 1,
                                mt: { xs: 1, sm: 0 },
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleWfhAction(user._id, "approved")}
                                sx={{
                                  color: "success.main",
                                  height: { xs: "28px", sm: "32px" },
                                  width: { xs: "28px", sm: "32px" },
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
                                onClick={() => handleWfhAction(user._id, "rejected")}
                                sx={{
                                  color: "error.main",
                                  height: { xs: "28px", sm: "32px" },
                                  width: { xs: "28px", sm: "32px" },
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
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </StyledTableContainer>
          )}
        </CardContent>

        <WorkFromHomeModal
          open={applyModalOpen}
          onClose={handleApplyModalClose}
          startDate={wfhDateRange[0]}
          endDate={wfhDateRange[1]}
          setDateRange={setWfhDateRange}
          reason={wfhReason}
          setReason={setWfhReason}
          submitted={submitted}
          setSubmitted={setSubmitted}
          showSnackbar={(message, severity = "info") => {
            setSnackbar({ open: true, message, severity });
            setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 2000);
          }}
        />
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000} // <-- Set to 2000ms for all snackbars
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              backgroundColor:
                snackbar.severity === "success"
                  ? "#e6f4ea"
                  : snackbar.severity === "error"
                    ? "#fdecea"
                    : "#f5f5f5",
              color:
                snackbar.severity === "success"
                  ? "#2e7d32"
                  : snackbar.severity === "error"
                    ? "#d32f2f"
                    : "#333",
              fontWeight: 500,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        <ConfirmationDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onConfirm={handleConfirmAction}
          title={`Confirm WFH ${actionType === "approved" ? "Approval" : "Rejection"
            }`}
          message={`Are you sure you want to ${actionType === "approved" ? "approve" : "reject"
            } this WFH request?`}
          confirmText={
            actionType === "approved" ? "Approve" : "Reject"
          }
          actionType={actionType}
          loading={loading}
        />
      </Card>
    </Container>
  );
};

export default WorkFromHome;
