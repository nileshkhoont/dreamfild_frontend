import React, { useEffect, useState } from "react";
import { Calendar1, Clock1, FileX2, Users2, Search, ClipboardList } from "lucide-react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  styled,
  Snackbar,
  Alert,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { AiOutlineCalendar } from "react-icons/ai";
// ...existing code...
import { useEmployee } from "../../utils/EmployeeContext";
import { useGetLeaveMutation, useUpdateLeaveStatusMutation, useApplyLeaveMutation } from "../../apiService";
import { CustomLoader, LoaderContainer } from "../Layout/CustomLoader";
import { Check, Close } from "@mui/icons-material";
import { ConfirmationDialog } from "../Layout/ConfirmationDialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTheme } from "@mui/material/styles";
import { useGlobalSnackbar } from "../../utils/SnackbarContext";
import TableSortLabel from "@mui/material/TableSortLabel";

// Utility functions
const descendingComparator = (a, b, orderBy) => {
  if (orderBy === "startDate" || orderBy === "endDate") return new Date(b[orderBy]) - new Date(a[orderBy]);
  if (orderBy === "status") {
    const statusOrder = { pending: 1, approved: 2, rejected: 3 };
    return statusOrder[b[orderBy].toLowerCase()] - statusOrder[a[orderBy].toLowerCase()];
  }
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
};

const getComparator = (order, orderBy) =>
  order === "desc" ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);

const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

const truncateText = (text, maxLength) => (text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  return `${day}-${month}-${year}, ${weekday}`;
};

const formatDayMonthYear = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

// Styled components
const Container = styled(Box)({
  margin: "0 auto",
  paddingTop: "2rem", // <-- Change from "2rem" to "0.1rem"
});
const StatsGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "1.5rem",
  marginBottom: "2rem",
  "@media (max-width: 968px)": { gridTemplateColumns: "repeat(1, 1fr)" },
}));
const StatCard = styled(Card)({
  background: "#ffffff",
  color: "var(--textColor)",
  borderRadius: 16,
  boxShadow: "var(--boxShadow)",
});
const IconWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: "var(--backgroundColor)",
  borderRadius: 12,
  padding: theme.spacing(1.5),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--textColor)",
}));
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  border: "none",
  overflowX: "auto",
  "& .MuiTableHead-root": {
    position: "sticky",
    top: 0,
    zIndex: 0,
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
const NoRecordsMessage = styled(Box)({
  textAlign: "center",
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});
const NoRecordsIcon = styled(Box)({ color: "#666", opacity: 0.7, marginBottom: "1rem" });

// Reusable Components
const StatCardComponent = ({ icon, title, value, bgColor, iconColor }) => (
  <StatCard>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconWrapper sx={{ backgroundColor: bgColor }}>
          {React.cloneElement(icon, { size: 24, color: iconColor })}
        </IconWrapper>
        <Box>
          <Typography variant="body2" sx={{ color: "var(--textColor)" }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "var(--textColor)" }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </StatCard>
);

const NoRecords = ({ message }) => (
  <NoRecordsMessage>
    <NoRecordsIcon>
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
        <FileX2 size={24} color="#757575" />
      </Box>
    </NoRecordsIcon>
    <Typography variant="body1" sx={{ color: "var(--textColor)", fontStyle: "italic" }}>
      {message}
    </Typography>
  </NoRecordsMessage>
);

const LeaveTable = ({ leaveDetails, order, orderBy, handleRequestSort, loggedInUser, handleLeaveAction }) => (
  <StyledTableContainer component={Paper} elevation={0} sx={{ width: "100%" }}>
    <Table sx={{ minWidth: 900, width: "100%" }}>
      <TableHead>
        <TableRow>
          <TableCell sortDirection={orderBy === "leaveType" ? order : false}>
            <TableSortLabel
              active={orderBy === "leaveType"}
              direction={orderBy === "leaveType" ? order : "asc"}
              onClick={(e) => handleRequestSort(e, "leaveType")}
            >
              Leave Type
            </TableSortLabel>
          </TableCell>
          <TableCell sortDirection={orderBy === "startDate" ? order : false}>
            <TableSortLabel
              active={orderBy === "startDate"}
              direction={orderBy === "startDate" ? order : "asc"}
              onClick={(e) => handleRequestSort(e, "startDate")}
            >
              Start Date
            </TableSortLabel>
          </TableCell>
          <TableCell sortDirection={orderBy === "endDate" ? order : false}>
            <TableSortLabel
              active={orderBy === "endDate"}
              direction={orderBy === "endDate" ? order : "asc"}
              onClick={(e) => handleRequestSort(e, "endDate")}
            >
              End Date
            </TableSortLabel>
          </TableCell>
          <TableCell>Days</TableCell>
          <TableCell>Reason</TableCell>
          <TableCell sortDirection={orderBy === "status" ? order : false}>
            <TableSortLabel
              active={orderBy === "status"}
              direction={orderBy === "status" ? order : "asc"}
              onClick={(e) => handleRequestSort(e, "status")}
            >
              Status
            </TableSortLabel>
          </TableCell>
        </TableRow>
      </TableHead>
    </Table>

    <Box sx={{
      height: "calc(100vh - 422px)",
      maxHeight: "calc(100vh - 422px)", overflowY: "auto",
    }}>
      <Table sx={{ minWidth: 900, width: "100%" }}>
        <TableBody>
          {leaveDetails.map((leave, index) => (
            <TableRow key={index}>
              <TableCell>{leave.leaveType}</TableCell>
              <TableCell>{formatDate(leave.startDate)}</TableCell>
              <TableCell>{formatDate(leave.endDate)}</TableCell>
              <TableCell>
                {leave.leaveTypeCounts && leave.leaveTypeCounts.length > 0
                  ? leave.leaveTypeCounts
                    .filter((lc) => lc.count > 0)
                    .map((lc) => {
                      if (lc.type === "First-half") return `${lc.count}FH`;
                      if (lc.type === "Second-half") return `${lc.count}SH`;
                      if (lc.type === "Full-day") return `${lc.count}D`;
                      return null;
                    })
                    .filter(Boolean)
                    .join(" ")
                  : "-"}
              </TableCell>
              <TableCell>
                <Tooltip title={leave.reason} arrow placement="top">
                  <span>{truncateText(leave.reason, 10)}</span>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StatusBadge status={leave.status.toLowerCase()}>{leave.status.toLowerCase()}</StatusBadge>
                  {leave.status.toLowerCase() === "pending" && loggedInUser?.role !== "user" && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleLeaveAction(leave.leaveId, "approved")}
                        sx={{
                          color: "success.main",
                          height: "32px",
                          width: "32px",
                          borderRadius: "6px",
                          transition: "all 0.2s ease",
                          "&:hover": { bgcolor: "success.main", color: "white" },
                        }}
                      >
                        <Check fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleLeaveAction(leave.leaveId, "rejected")}
                        sx={{
                          color: "error.main",
                          height: "32px",
                          width: "32px",
                          borderRadius: "6px",
                          transition: "all 0.2s ease",
                          "&:hover": { bgcolor: "error.light", color: "white" },
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  </StyledTableContainer>
);

// Add this definition for SingleEmployeeLeave within the same file
const SingleEmployeeLeave = ({
  leaveData,
  handleLeaveAction,
  loggedInUser,
  refetchData,
  setParentSnackbar,
  applyModalOpen,
  setApplyModalOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const now = new Date();
  const startOf5MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 4, 1);
  const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const [dateRange, setDateRange] = React.useState([startOf5MonthsAgo, endOfCurrentMonth]);
  const [startDate, endDate] = dateRange;

  // Add sorting state
  const [order, setOrder] = useState("desc"); // default to latest first
  const [orderBy, setOrderBy] = useState("startDate"); // or "endDate"

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sorted leave details
  const sortedLeaveDetails = React.useMemo(() => {
    if (!leaveData.leaveDetails) return [];
    return leaveData.leaveDetails.slice().sort((a, b) => {
      let aValue = new Date(a[orderBy]);
      let bValue = new Date(b[orderBy]);
      return bValue - aValue; // descending
    });
  }, [leaveData.leaveDetails, orderBy]);

  const handleDateRangeChange = (update) => {
    setDateRange(update);
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return "";
    const startFormatted = `${String(start.getDate()).padStart(2, "0")}/${String(start.getMonth() + 1).padStart(2, "0")}/${start.getFullYear()}`;
    const endFormatted = `${String(end.getDate()).padStart(2, "0")}/${String(end.getMonth() + 1).padStart(2, "0")}/${end.getFullYear()}`;
    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <Card
      sx={{
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ClipboardList size={22} color="var(--textColor)" />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "var(--textColor)",
                  textAlign: "left",
                  fontSize: "22px",
                }}
                component="span"
              >
                {leaveData.name}'s Leave History
              </Typography>
            </Box> <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={handleDateRangeChange}
                  isClearable
                  placeholderText="Select date range"
                  dateFormat="dd/MM/yyyy"
                  customInput={
                    <TextField
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Calendar1 size={16} color="#666" />
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
                />
              </Box>

              {loggedInUser?.role === "user" && (<Button variant="contained" size="small" sx={{ backgroundColor: "var(--purpleShadeBg)", color: "#fff", borderRadius: "12px", fontWeight: 500, fontSize: "14px", textTransform: "none", px: 2, height: "40px", minWidth: "120px", boxShadow: "none", "&:hover": { backgroundColor: "var(--purpleShadeBg)", boxShadow: "none" } }} onClick={() => setApplyModalOpen(true)}>Apply Leave</Button>)}
            </Box>
          </Box>
        }
      />
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {leaveData.leaveDetails && leaveData.leaveDetails.length > 0 ? (
          <LeaveTable
            leaveDetails={sortedLeaveDetails}
            order={order}
            orderBy={orderBy}
            handleRequestSort={handleRequestSort}
            loggedInUser={loggedInUser}
            handleLeaveAction={handleLeaveAction}
          />
        ) : (
          <NoRecords message="No leave records found for this employee." />
        )}
      </CardContent>
    </Card>
  );
};

// Main Leave Component
const Leave = () => {
  const [updateLeaveStatus] = useUpdateLeaveStatusMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = React.useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const { selectedEmployee } = useEmployee();
  const [getLeave, { data: leaveData, isLoading }] = useGetLeaveMutation();

  // ADD THESE NEW STATES FOR APPLY LEAVE FUNCTIONALITY
  const [applyLeave, { isLoading: isApplying }] = useApplyLeaveMutation();
  const defaultFormState = {
    startDate: null,
    endDate: null,
    leaveType: "",
    halfDay: "",
    reason: "",
    status: "pending",
    leaveDates: [],
    submitted: false
  };
  const [form, setForm] = useState(defaultFormState);

  // ADD THESE HELPER FUNCTIONS
  const formatDayMonthYear = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const handleFormChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleDateRangeChange = (update) => {
    const [start, end] = update;
    handleFormChange("startDate", start);
    handleFormChange("endDate", end);
    setSnackbar({ open: false, message: "", severity: "info" });
    setForm((prev) => ({ ...prev, submitted: false }));

    if (start && end) {
      const days = [];
      let cursor = new Date(start);
      const last = new Date(end);
      while (cursor <= last) {
        days.push({ date: new Date(cursor), leaveType: "", halfDay: "" });
        cursor.setDate(cursor.getDate() + 1);
      }
      setForm((prev) => ({ ...prev, leaveDates: days, halfDay: "" }));
    } else {
      setForm((prev) => ({ ...prev, leaveDates: [], halfDay: "" }));
    }
  };

  const handleApplyLeave = async () => {
    try {
      setForm((prev) => ({ ...prev, submitted: true }));
      if (!form.startDate || !form.endDate) {
        setSnackbar({ open: true, message: "Please select a valid date range.", severity: "error" });
        return;
      }
      // Check for past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (form.startDate < today || form.endDate < today) {
        setSnackbar({ open: true, message: "Please select today or future date.", severity: "error" });
        return;
      }
      if (!form.leaveType || !form.halfDay || !form.reason.trim()) {
        setSnackbar({ open: true, message: "Please fill all required fields.", severity: "error" });
        return;
      }
      // Generate leaveDates array with one entry per day in the range
      const leaveDates = [];
      let cursor = new Date(form.startDate);
      const last = new Date(form.endDate);
      while (cursor <= last) {
        leaveDates.push({
          date: new Date(cursor),
          leaveType: form.leaveType,
          halfDay: form.halfDay,
          reason: form.reason
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      await applyLeave({ leaveDates }).unwrap();
      setApplyModalOpen(false);
      setForm(defaultFormState);
      setSnackbar({ open: true, message: "Leave applied successfully!", severity: "success" });
      await refetchData();
    } catch (error) {
      setSnackbar({ open: true, message: error?.data?.responseMessage || "Failed to apply leave", severity: "error" });
    }
  };

  const handleCloseApplyModal = () => {
    setApplyModalOpen(false);
    setForm({ ...defaultFormState });
  };

  // ADD USEEFFECT FOR FORM VALIDATION
  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (start.toDateString() !== end.toDateString() && form.halfDay !== "Full-day") {
        setForm((prev) => ({ ...prev, halfDay: "Full-day" }));
      }
      if (start.toDateString() === end.toDateString() && (form.halfDay === "Full-day" || form.halfDay === "")) {
        setForm((prev) => ({ ...prev, halfDay: "" }));
      }
    }
  }, [form.startDate, form.endDate]);

  const loggedInUser = React.useMemo(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try { return JSON.parse(userStr); } catch { return null; }
  }, []);

  const effectiveSelectedEmployee = loggedInUser?.role === "user" ? loggedInUser?._id : selectedEmployee;

  useEffect(() => {
    const fetchLeave = async () => {
      try {
        if (effectiveSelectedEmployee) { await getLeave({ userId: effectiveSelectedEmployee }); }
        else { await getLeave(); }
      } catch (error) { }
    };
    fetchLeave();
  }, [effectiveSelectedEmployee, getLeave]);

  const handleLeaveAction = async (leaveId, status) => {
    setSelectedLeave(leaveId);
    setActionType(status);
    setDialogOpen(true);
  };

  const refetchData = async () => {
    try {
      if (effectiveSelectedEmployee) { await getLeave({ userId: effectiveSelectedEmployee }); }
      else { await getLeave(); }
    } catch (error) { }
  };

  const [actionLoading, setActionLoading] = useState(false);

  const handleConfirmAction = async (comment) => {
    setActionLoading(true);
    setSnackbar({ open: true, message: "Processing...", severity: "info" });
    try {
      const response = await updateLeaveStatus({ leaveId: selectedLeave, status: actionType, comment: comment }).unwrap();
      setSnackbar({ open: true, message: response.responseMessage, severity: "success" });
      setDialogOpen(false);
      await refetchData();
    } catch (error) {
      setSnackbar({ open: true, message: error?.data?.responseMessage || "Failed to update leave status", severity: "error" });
    } finally {
      setActionLoading(false);
      setDialogOpen(false);
      setSelectedLeave(null);
      setActionType(null);
    }
  };

  const showSnackbar = useGlobalSnackbar();

  // ...socket.io logic removed...

  const filteredLeaveData = React.useMemo(() => {
    if (!leaveData?.responseData?.leaveDetails) return [];
    let filtered = leaveData.responseData.leaveDetails;
    if (startDate && endDate) {
      filtered = filtered.filter((leave) => {
        const leaveStartDate = new Date(leave.startDate);
        const leaveEndDate = new Date(leave.endDate);
        const leaveStartDateOnly = new Date(leaveStartDate.getFullYear(), leaveStartDate.getMonth(), leaveStartDate.getDate());
        const leaveEndDateOnly = new Date(leaveEndDate.getFullYear(), leaveEndDate.getMonth(), leaveEndDate.getDate());
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        return leaveStartDateOnly <= endDateOnly && leaveEndDateOnly >= startDateOnly;
      });
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((leave) => leave.name.toLowerCase().includes(searchLower) || formatDate(leave.startDate).toLowerCase().includes(searchLower) || formatDate(leave.endDate).toLowerCase().includes(searchLower) || leave.leaveType.toLowerCase().includes(searchLower) || leave.reason.toLowerCase().includes(searchLower) || leave.status.toLowerCase().includes(searchLower));
    }
    return filtered;
  }, [leaveData, searchTerm, startDate, endDate]);

  // Change these initial states for admin table:
  const [allOrder, setAllOrder] = useState("desc"); // was "asc"
  const [allOrderBy, setAllOrderBy] = useState("startDate"); // or "endDate"

  const handleAllRequestSort = (event, property) => {
    const isAsc = allOrderBy === property && allOrder === "asc";
    setAllOrder(isAsc ? "desc" : "asc");
    setAllOrderBy(property);
  };

  const sortedFilteredLeaveData = React.useMemo(() => {
    if (!filteredLeaveData) return [];
    return filteredLeaveData.slice().sort((a, b) => {
      let aValue = a[allOrderBy];
      let bValue = b[allOrderBy];
      if (allOrderBy === "startDate" || allOrderBy === "endDate") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      if (aValue < bValue) return allOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return allOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredLeaveData, allOrder, allOrderBy]);

  if (isLoading || !leaveData) {
    return (<LoaderContainer><CustomLoader color="var(--purpleShadeBg)" /></LoaderContainer>);
  }

  return (
    <Container>
      <StatsGrid>
        {effectiveSelectedEmployee ? (
          <>
            <StatCardComponent
              icon={<Clock1 />}
              title="Total Paid Leaves"
              value={leaveData.responseData.remainingLeave3Months}
              bgColor="var(--redShadeBg)"
              iconColor="var(--redShadeColor)"
            />
            <StatCardComponent
              icon={<Calendar1 />}
              title="Availed Leave"
              value={leaveData.responseData.availedLeave}
              bgColor="#e2dff7"
              iconColor="#8e83f2"
            />
            <StatCardComponent
              icon={<Users2 />}
              title="Leave without pay"
              value={leaveData.responseData.LeaveWorkPaid}
              bgColor="var(--blueShadeBg)"
              iconColor="var(--blueShadeColor)"
            />
          </>
        ) : (
          <>
            <StatCard><CardContent sx={{ p: 3 }}><Box sx={{ display: "flex", alignItems: "center", gap: 2 }}><IconWrapper sx={{ backgroundColor: "var(--blueShadeBg)" }}><Users2 size={24} color="var(--blueShadeColor)" /></IconWrapper><Box><Typography variant="body2" sx={{ color: "var(--textColor)" }}>Total Requests</Typography><Typography variant="h5" sx={{ fontWeight: 600, color: "var(--textColor)" }}>{leaveData?.responseData?.totalRequests}</Typography></Box></Box></CardContent></StatCard>
            <StatCard><CardContent sx={{ p: 3 }}><Box sx={{ display: "flex", alignItems: "center", gap: 2 }}><IconWrapper sx={{ backgroundColor: "var(--redShadeBg)" }}><Clock1 size={24} color="var(--redShadeColor)" /></IconWrapper><Box><Typography variant="body2" sx={{ color: "var(--textColor)" }}>Pending Approvals</Typography><Typography variant="h5" sx={{ fontWeight: 600, color: "var(--textColor)" }}>{leaveData?.responseData?.pendingApprovals}</Typography></Box></Box></CardContent></StatCard>
            <StatCard><CardContent sx={{ p: 3 }}><Box sx={{ display: "flex", alignItems: "center", gap: 2 }}><IconWrapper sx={{ backgroundColor: "var(--greenShadeBg)" }}><Calendar1 size={24} color="var(--greenShadeColor)" /></IconWrapper><Box><Typography variant="body2" sx={{ color: "var(--textColor)" }}>On Leave Today</Typography><Typography variant="h5" sx={{ fontWeight: 600, color: "var(--textColor)" }}>{leaveData?.responseData?.onLeaveToday}</Typography></Box></Box></CardContent></StatCard>
          </>
        )}
      </StatsGrid>
      {effectiveSelectedEmployee ? (
        <SingleEmployeeLeave leaveData={leaveData.responseData} handleLeaveAction={handleLeaveAction} loggedInUser={loggedInUser} refetchData={refetchData} setParentSnackbar={setSnackbar} applyModalOpen={applyModalOpen} setApplyModalOpen={setApplyModalOpen} />
      ) : (
        !effectiveSelectedEmployee && (
          <Card sx={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            height: "calc(100vh - 260px)", // <-- Change from "calc(100vh - 260px)" to "calc(100vh - 130px)"
            display: "flex",

            flexDirection: "column"
          }}>
            <CardHeader title={<Box sx={{ display: "flex", alignItems: "center", gap: 1, minHeight: 48 }}><ClipboardList size={22} color="var(--textColor)" /><Typography variant="h5" sx={{ fontWeight: 600, color: "var(--textColor)", textAlign: "left", lineHeight: 1.2, fontSize: "22px" }} component="span">All Employees Leave Requests</Typography></Box>} />
            <Box sx={{ px: 3, pt: 1, pb: 0, display: "flex", gap: 2, flexWrap: "wrap", marginTop: "-20px" }}>
              <Box sx={{ minWidth: 220 }}>
                <TextField placeholder="Search by name" variant="outlined" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="small" InputProps={{ startAdornment: (<InputAdornment position="start"><Search size={18} /></InputAdornment>) }} sx={{ width: "100%", "& .MuiInputBase-root": { fontSize: "14px", borderRadius: "12px", height: "40px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--textFieldBorderColor, #ced4da)", borderRadius: "12px" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--textFieldBorderColor, #ced4da)" }, "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline": { borderColor: "var(--textFieldFocusBorderColor, #343a40)", borderWidth: 1 } }} />
              </Box>
              <Box sx={{ minWidth: 220, flex: "1 1 220px" }}>
                <DatePicker selectsRange={true} startDate={startDate} endDate={endDate} onChange={(update) => setDateRange(update)} isClearable={true} placeholderText="Select date range" dateFormat="dd/MM/yyyy" popperProps={{ strategy: "fixed", placement: "bottom-start" }} customInput={<TextField className="custom-textfield" size="small" InputProps={{ startAdornment: (<InputAdornment position="start"><Calendar1 size={16} color="#666" /></InputAdornment>) }} sx={{ width: { xs: "100%", sm: "250px" }, "& .MuiInputBase-root": { fontSize: "14px", borderRadius: "12px", height: "40px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--textFieldBorderColor, #ced4da)", borderRadius: "12px" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--textFieldBorderColor, #ced4da)" }, "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline": { borderColor: "var(--textFieldFocusBorderColor, #343a40)", borderWidth: 1 } }} />} calendarClassName="custom-datepicker-calendar" dayClassName={(date) => { const isSelected = startDate && endDate && date >= startDate && date <= endDate; return isSelected ? "custom-datepicker-selected" : "custom-datepicker-day"; }} />
              </Box>
            </Box>
            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
              {sortedFilteredLeaveData.length > 0 ? (
                <StyledTableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    width: "100%",
                    height: "calc(100vh - 400px)", // <-- Keep this same as WorkFromHome
                    maxHeight: "calc(100vh - 400px)", // <-- Keep this same as WorkFromHome
                    overflow: "hidden", // <-- Keep this same as WorkFromHome

                  }}
                >
                  {/* Table Head (sticky) */}
                  <Table sx={{ tableLayout: "auto", minWidth: 900, width: "100%" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ minWidth: 120 }} sortDirection={allOrderBy === "name" ? allOrder : false}>
                          <TableSortLabel
                            active={allOrderBy === "name"}
                            direction={allOrderBy === "name" ? allOrder : "asc"}
                            onClick={(e) => handleAllRequestSort(e, "name")}
                          >
                            Employee
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ minWidth: 150 }} sortDirection={allOrderBy === "leaveType" ? allOrder : false}>
                          <TableSortLabel
                            active={allOrderBy === "leaveType"}
                            direction={allOrderBy === "leaveType" ? allOrder : "asc"}
                            onClick={(e) => handleAllRequestSort(e, "leaveType")}
                          >
                            Leave Type
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ minWidth: 160 }} sortDirection={allOrderBy === "startDate" ? allOrder : false}>
                          <TableSortLabel
                            active={allOrderBy === "startDate"}
                            direction={allOrderBy === "startDate" ? allOrder : "asc"}
                            onClick={(e) => handleAllRequestSort(e, "startDate")}
                          >
                            Start Date
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ minWidth: 160 }} sortDirection={allOrderBy === "endDate" ? allOrder : false}>
                          <TableSortLabel
                            active={allOrderBy === "endDate"}
                            direction={allOrderBy === "endDate" ? allOrder : "asc"}
                            onClick={(e) => handleAllRequestSort(e, "endDate")}
                          >
                            End Date
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ minWidth: 80 }}>Days</TableCell>
                        {(selectedEmployee || loggedInUser?.role === "user") && (
                          <TableCell sx={{ minWidth: 120 }}>Reason</TableCell>
                        )}
                        <TableCell sx={{ minWidth: 120 }} sortDirection={allOrderBy === "status" ? allOrder : false}>
                          <TableSortLabel
                            active={allOrderBy === "status"}
                            direction={allOrderBy === "status" ? allOrder : "asc"}
                            onClick={(e) => handleAllRequestSort(e, "status")}
                          >
                            Status
                          </TableSortLabel>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                  {/* Scrollable Table Body */}
                  <Box
                    sx={{
                      height: "calc(100vh - 330px)", // <-- Keep this same as WorkFromHome (50px less than container)
                      maxHeight: "calc(100vh - 330px)", // <-- Keep this same as WorkFromHome
                      overflowY: "auto",
                      overflowX: "hidden",

                    }}
                  >
                    <Table sx={{ minWidth: 900, width: "100%" }}>
                      <TableBody>
                        {sortedFilteredLeaveData.map((leave, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ fontWeight: selectedEmployee ? 700 : 500 }}>
                              {leave.name}
                            </TableCell>
                            <TableCell>{leave.leaveType}</TableCell>
                            <TableCell>{formatDate(leave.startDate)}</TableCell>
                            <TableCell>{formatDate(leave.endDate)}</TableCell>
                            <TableCell>
                              {leave.leaveTypeCounts && leave.leaveTypeCounts.length > 0
                                ? leave.leaveTypeCounts
                                  .filter((lc) => lc.count > 0)
                                  .map((lc) => {
                                    if (lc.type === "First-half") return `${lc.count}FH`;
                                    if (lc.type === "Second-half") return `${lc.count}SH`;
                                    if (lc.type === "Full-day") return `${lc.count}D`;
                                    return null;
                                  })
                                  .filter(Boolean)
                                  .join(" ")
                                : "-"}
                            </TableCell>
                            {(selectedEmployee || loggedInUser?.role === "user") && (
                              <TableCell>
                                <Tooltip title={leave.reason} arrow placement="top">
                                  <span>{truncateText(leave.reason, 10)}</span>
                                </Tooltip>
                              </TableCell>
                            )}
                            <TableCell>
                              <StatusBadge status={leave.status.toLowerCase()}>
                                {leave.status.toLowerCase()}
                              </StatusBadge>
                              {/* ...action buttons if needed... */}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </StyledTableContainer>
              ) : (
                <NoRecordsMessage sx={{ flexGrow: 1, py: 6 }}>
                  <NoRecordsIcon><Box sx={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)", display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5, opacity: 0.8 }}><ClipboardList size={24} color="#757575" /></Box></NoRecordsIcon>
                  <Typography variant="body1" sx={{ color: "var(--textColor)", fontStyle: "italic" }}>No records found matching your search criteria</Typography>
                </NoRecordsMessage>
              )}
            </CardContent>
          </Card>
        )
      )}
      <ConfirmationDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onConfirm={handleConfirmAction} title={`Confirm Leave ${actionType === "approved" ? "Approval" : "Rejection"}`} message={`Are you sure you want to ${actionType === "approved" ? "approve" : "reject"} this leave request?`} confirmText={actionType === "approved" ? "Approve" : "Reject"} actionType={actionType} loading={actionLoading} />
      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={snackbar.anchorOrigin || { vertical: "top", horizontal: "right" }}><Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert></Snackbar>

      {/* ADD THE APPLY LEAVE MODAL */}
      {loggedInUser?.role === "user" && (
        <Dialog
          open={applyModalOpen}
          onClose={handleCloseApplyModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { minHeight: 480, minWidth: 480, borderRadius: 4, boxShadow: "0 8px 32px rgba(80, 60, 180, 0.15)", background: "#fff" } }}
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: 22, color: "var(--purpleShadeBg)", pb: 1, display: "flex", alignItems: "center", gap: 1.2 }}>
            <AiOutlineCalendar size={22} />Apply for Leave
          </DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3, px: 3, py: 2, background: "rgba(255,255,255,0.95)", borderRadius: 3 }}>
            <DatePicker
              selectsRange
              startDate={form.startDate}
              endDate={form.endDate}
              onChange={handleDateRangeChange}
              minDate={new Date()}
              isClearable
              placeholderText="Select date range"
              dateFormat="dd/MM/yyyy"
              popperProps={{ strategy: "fixed", placement: "bottom-start" }}
              customInput={
                <TextField
                  className="custom-textfield"
                  size="small"
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Calendar1 size={16} color="#666" /></InputAdornment>) }}
                  sx={{ width: { xs: "100%", sm: "250px" }, "& .MuiInputBase-root": { fontSize: "14px", borderRadius: "12px", height: "40px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: (!form.startDate || !form.endDate) && form.submitted ? "#f44336" : "var(--textFieldBorderColor, #ced4da)", borderRadius: "12px" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: (!form.startDate || !form.endDate) && form.submitted ? "#f44336" : "var(--textFieldBorderColor, #ced4da)" }, "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline": { borderColor: (!form.startDate || !form.endDate) && form.submitted ? "#f44336" : "var(--textFieldFocusBorderColor, #343a40)", borderWidth: 1 } }}
                />
              }
              calendarClassName="custom-datepicker-calendar"
              dayClassName={(date) => { const inRange = form.startDate && form.endDate && date >= form.startDate && date <= form.endDate; return inRange ? "custom-datepicker-selected" : "custom-datepicker-day"; }}
            />

            {form.startDate && form.endDate && (
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", borderRadius: 2, p: 1 }}>
                <Typography sx={{ minWidth: 120, fontWeight: 500, fontSize: 16 }}>
                  {formatDayMonthYear(form.startDate)} - {formatDayMonthYear(form.endDate)}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <label htmlFor="leave-type" style={{ fontSize: "14px", fontWeight: 500, color: "var(--textColor, #374151)" }}>
                    Leave Type <span style={{ color: "#f44336" }}>*</span>
                  </label>
                  <TextField
                    id="leave-type"
                    value={form.leaveType}
                    onChange={(e) => setForm((prev) => ({ ...prev, leaveType: e.target.value }))}
                    select
                    size="small"
                    required
                    sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: "14px", height: "40px" } }}
                  >
                    <MenuItem value="Sick leave">Sick leave</MenuItem>
                    <MenuItem value="Paid leave">Paid leave</MenuItem>
                    <MenuItem value="Personal leave">Personal leave</MenuItem>
                    <MenuItem value="Other leave">Other leave</MenuItem>
                  </TextField>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <label htmlFor="half-day" style={{ fontSize: "14px", fontWeight: 500, color: "var(--textColor, #374151)" }}>
                    Half Day <span style={{ color: "#f44336" }}>*</span>
                  </label>
                  <TextField
                    id="half-day"
                    value={form.halfDay}
                    onChange={(e) => setForm((prev) => ({ ...prev, halfDay: e.target.value }))}
                    select
                    size="small"
                    required
                    sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: "14px", height: "40px" } }}
                  >
                    <MenuItem value="First-half">First‑half</MenuItem>
                    <MenuItem value="Second-half">Second‑half</MenuItem>
                    <MenuItem value="Full-day">Full‑day</MenuItem>
                  </TextField>
                </Box>
              </Box>
            )}

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
              <label htmlFor="reason-input" style={{ fontSize: "14px", fontWeight: 500, color: "var(--textColor, #374151)", marginBottom: "4px" }}>
                Reason <span style={{ color: "#f44336" }}>*</span>
              </label>
              <textarea
                id="reason-input"
                value={form.reason}
                onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                rows={3}
                required
                style={{ width: "100%", padding: "10px 14px", fontSize: "14px", fontFamily: "inherit", borderRadius: "12px", border: !form.reason && form.submitted ? "1px solid #f44336" : "1px solid var(--textFieldBorderColor, #ced4da)", outline: "none", resize: "vertical", backgroundColor: "#fff", color: "var(--textColor, #374151)", transition: "border-color 0.2s" }}
                placeholder="Please provide a reason for your leave request"
              />
              {!form.reason && form.submitted && (<span style={{ color: "#f44336", fontSize: "12px" }}>Please enter a reason for your leave</span>)}
            </div>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseApplyModal}
              sx={{ fontWeight: 600, fontSize: 15, borderRadius: "12px", textTransform: "none", color: "var(--textColor)", border: "1px solid var(--textFieldBorderColor, #ced4da)", padding: "8px 20px", "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" } }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyLeave}
              disabled={isApplying}
              sx={{ backgroundColor: "var(--purpleShadeBg)", color: "#fff", border: "none", borderRadius: "12px", padding: "8px 24px", fontWeight: 600, fontSize: 15, textTransform: "none", whiteSpace: "nowrap", boxShadow: "none", "&:hover": { backgroundColor: "var(--purpleShadeBg)", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" } }}
            >
              {isApplying ? (<CircularProgress size={20} sx={{ color: "#fff" }} />) : ("Submit")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default Leave;