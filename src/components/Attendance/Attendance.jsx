import React, { useEffect } from "react";
import {
  Clock1,
  Calendar1,
  Users2,
  FileX2,
  Database,
  CalendarDays,
  Search,
} from "lucide-react";
import TableSortLabel from "@mui/material/TableSortLabel";
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
  alpha,
  FormControlLabel,
  Switch,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import { useEmployee } from "../../utils/EmployeeContext";
import {
  useGetAttendanceMutation,
  useGetLocationQuery,
} from "../../apiService";
import { CustomLoader, LoaderContainer } from "../Layout/CustomLoader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTheme } from "@mui/material/styles";
import Snackbar from "@mui/material/Snackbar";

const Container = styled(Box)({
  margin: "0 auto",
  paddingTop: "2rem",
  overflow: "hidden",
});
const NoRecordsMessage = styled(Box)({
  textAlign: "center",
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});
const NoRecordsIcon = styled(Box)(({ theme }) => ({
  color: "#666",
  opacity: 0.7,
  marginBottom: "1rem",
}));
const StatsGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "1.5rem",
  marginBottom: "2rem",
  "@media (max-width: 968px)": { gridTemplateColumns: "repeat(1, 1fr)" },
}));
const StatCard = styled(Card)(({ theme }) => ({
  background: "#ffffff",
  color: "#0046f6",
  borderRadius: 16,
  boxShadow: "var(--boxShadow)",
}));
const IconWrapper = styled(Box)(({ theme, color }) => ({
  backgroundColor: "var(--backgroundColor)",
  borderRadius: 12,
  padding: theme.spacing(1.5),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: color || "var(--textColor)",
}));
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  border: "none",
  "& .MuiTableCell-head": {
    backgroundColor: "var(--tableHeaderBackgroundColor)",
    fontWeight: 600,
    color: "var(--textColor)",
    borderBottom: "none",
    position: "sticky", // Make header sticky
    top: 0, // Stick to top of scroll area
    zIndex: 0, // Ensure header stays above table body
  },
  "& .MuiTableCell-root": { borderBottom: "none", borderRight: "none" },
  "& .MuiTableRow-root:hover": {
    backgroundColor: "var(--hoverBackgroundColor)",
    transition: "background-color 0.3s ease",
  },
}));
const StatusBadge = styled(Box)(({ theme, status }) => {
  const normalized = (status || "").toLowerCase();
  let bgColor = alpha("#0046f6", 0.1),
    color = "#0046f6";
  if (normalized.includes("missed")) {
    bgColor = alpha(theme.palette.error.main, 0.1);
    color = theme.palette.error.main;
  } else if (normalized.includes("progress")) {
    bgColor = alpha(theme.palette.warning.main, 0.15);
    color = theme.palette.warning.main;
  } else if (normalized.includes("complete")) {
    bgColor = alpha(theme.palette.success.main, 0.15);
    color = theme.palette.success.main;
  }
  return {
    padding: "6px 12px",
    borderRadius: 20,
    fontWeight: 500,
    display: "inline-block",
    backgroundColor: bgColor,
    color: color,
    textTransform: "capitalize",
  };
});

const getWorkingDaysInCurrentMonth = () => {
  const now = new Date(),
    year = now.getFullYear(),
    month = now.getMonth(),
    lastDay = new Date(year, month + 1, 0).getDate();
  let workingDays = 0,
    saturdayCount = 0;
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day),
      dayOfWeek = date.getDay();
    if (dayOfWeek === 0) continue;
    else if (dayOfWeek === 6) {
      saturdayCount++;
      if (saturdayCount <= 2) continue;
    }
    workingDays++;
  }
  return workingDays;
};

const formatDate = (dateString) => {
  if (!dateString) return "Invalid Date";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  const day = date.getDate().toString().padStart(2, "0"),
    month = (date.getMonth() + 1).toString().padStart(2, "0"),
    year = date.getFullYear(),
    weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  return `${day}-${month}-${year} - ${weekday}`;
};

const isLateCheckIn = (punchInTime, punchOutTime, punchOutReferenceTime) => {
  if (!punchOutReferenceTime) return false;
  const toMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };
  const punchInMinutes = toMinutes(punchInTime),
    punchOutReferenceMinutes = toMinutes(punchOutReferenceTime);
  if (punchInMinutes === null || punchOutReferenceMinutes === null)
    return false;
  return punchInMinutes > punchOutReferenceMinutes;
};

{
  /*****************************Single Employee Attendance Component *************************************/
}
const SingleEmployeeAttendance = ({
  attendanceData,
  name,
  effectiveSelectedEmployee,
  getAttendance,
  dateRange,
  setDateRange,
  locationSettings,
  loggedInUser,
  showSnackbar,
}) => {
  const [showLateOnly, setShowLateOnly] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [startDate, endDate] = dateRange;
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("date");
  const [applyModalOpen, setApplyModalOpen] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [wfhReason, setWfhReason] = React.useState("");
  const [wfhDateRange, setWfhDateRange] = React.useState([null, null]);
  const [correctionDialogOpen, setCorrectionDialogOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState(null);

  const handlePunchCorrectionClick = (record, type) => {
    setSelectedRecord({ ...record, correctionType: type });
    setCorrectionDialogOpen(true);
  };
  const theme = typeof useTheme === "function" ? useTheme() : {};
  const punchOutReferenceTime = locationSettings?.data?.punchOutTime || null;
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredData = React.useMemo(() => {
    if (!attendanceData) return [];
    let filtered = attendanceData;
    const now = new Date(),
      currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1),
      currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (startDate && endDate) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.date);
        const startDateOnly = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          0,
          0,
          0,
          0
        );
        const endDateOnly = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate(),
          23,
          59,
          59,
          999
        );
        return recordDate >= startDateOnly && recordDate <= endDateOnly;
      });
    } else {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= currentMonthStart && recordDate <= currentMonthEnd;
      });
    }

    if (showLateOnly && punchOutReferenceTime) {
      filtered = filtered.filter((record) =>
        isLateCheckIn(record.punchIn, null, punchOutReferenceTime)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((record) =>
        formatDate(record.date).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [
    attendanceData,
    showLateOnly,
    searchTerm,
    startDate,
    endDate,
    punchOutReferenceTime,
  ]);

  const sortedAndFilteredData = React.useMemo(() => {
    const comparator = (a, b) => {
      let aValue = a[orderBy],
        bValue = b[orderBy];
      if (orderBy === "date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      if (order === "asc")
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      else return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    };
    return [...filteredData].sort(comparator);
  }, [filteredData, order, orderBy]);

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        color: "var(--textColor)",
        minHeight: "calc(100vh - 260px)", //
        maxHeight: "calc(100vh - 260px)", //
        display: "flex",
        flexDirection: "column",
      }}
      stickyHeader
    >
      <CardHeader
        title={
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minHeight: 48,
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
            >
              <CalendarDays size={22} color="var(--purpleShadeBg)" />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "var(--textColor)",
                  textAlign: "left",
                  lineHeight: 1.2,
                  fontSize: "22px",
                }}
                component="span"
              >
                {name}'s Monthly Attendance History
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mt: 1,
                flexWrap: "wrap",
              }}
            >
              {effectiveSelectedEmployee && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    minWidth: 250,
                    width: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flex: 1,
                    }}
                  >
                    <Box sx={{ minWidth: 250 }}>
                      <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => {
                          setDateRange(update);
                          if (update && update[0] && update[1]) {
                            const formatDate = (date) =>
                              new Date(date).toISOString().slice(0, 10);
                            const sDate = formatDate(update[0]),
                              eDate = formatDate(update[1]);
                            const payload = {
                              userId: effectiveSelectedEmployee,
                              startDate: sDate,
                              endDate: eDate,
                            };
                            getAttendance(payload);
                          }
                        }}
                        isClearable={true}
                        placeholderText="Select date range"
                        dateFormat="dd/MM/yyyy"
                        popperProps={{
                          strategy: "fixed",
                          placement: "bottom-end",
                        }}
                        customInput={
                          <TextField
                            className="custom-textfield"
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Calendar1
                                    size={16}
                                    color={
                                      theme.palette?.text?.secondary || "#666"
                                    }
                                  />
                                </InputAdornment>
                              ),
                              sx: { height: "40px" },
                            }}
                            sx={{
                              width: { xs: "100%", sm: "250px" },
                              borderRadius: "12px",
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "12px",
                                fontSize: "14px",
                                height: "40px",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor:
                                  "var(--textFieldBorderColor, #ced4da)",
                                borderRadius: "12px",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor:
                                  "var(--textFieldBorderColor, #ced4da)",
                              },
                              "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline":
                              {
                                borderColor:
                                  "var(--textFieldFocusBorderColor, #343a40)",
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
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showLateOnly}
                          onChange={(e) => setShowLateOnly(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <span
                          style={{
                            color: "var(--primaryColor)",
                            fontWeight: 500,
                            fontSize: "14px",
                          }}
                        >
                          Late Check-ins
                        </span>
                      }
                      sx={{
                        whiteSpace: "nowrap",
                        margin: 0,
                        alignItems: "center",
                        height: "40px",
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        }
      />

      {/**Card content */}
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        {attendanceData.length === 0 && attendanceData !== undefined ? (
          <NoRecordsMessage sx={{ flexGrow: 1 }}>
            <NoRecordsIcon>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.8,
                }}
              >
                <Database size={24} color="#757575" />
              </Box>
            </NoRecordsIcon>
            <Typography
              variant="body1"
              sx={{ color: "var(--textColor)", fontStyle: "italic" }}
            >
              No attendance records found for this employee
            </Typography>
          </NoRecordsMessage>
        ) : (
          <StyledTableContainer
            component={Paper}
            elevation={0}
            sx={{
              height: 400, // Set fixed height for scroll area
              overflowY: "auto", // Enable vertical scroll only for table body
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sortDirection={orderBy === "date" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "date"}
                      direction={orderBy === "date" ? order : "asc"}
                      onClick={() => handleRequestSort("date")}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={orderBy === "workingHours" ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === "workingHours"}
                      direction={orderBy === "workingHours" ? order : "asc"}
                      onClick={() => handleRequestSort("workingHours")}
                    >
                      Working Hours
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={orderBy === "punchIn" ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === "punchIn"}
                      direction={orderBy === "punchIn" ? order : "asc"}
                      onClick={() => handleRequestSort("punchIn")}
                    >
                      Punch In
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={orderBy === "punchOut" ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === "punchOut"}
                      direction={orderBy === "punchOut" ? order : "asc"}
                      onClick={() => handleRequestSort("punchOut")}
                    >
                      Punch Out
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={orderBy === "status" ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === "status"}
                      direction={orderBy === "status" ? order : "asc"}
                      onClick={() => handleRequestSort("status")}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              {/*table body content*/}

              <TableBody>
                {sortedAndFilteredData?.length > 0 ? (
                  sortedAndFilteredData.map((detail, index) => {
                    const isLate = isLateCheckIn(
                      detail.punchIn,
                      null,
                      punchOutReferenceTime
                    );
                    return (
                      <TableRow
                        key={index}
                        sx={
                          isLate
                            ? {
                              background:
                                "linear-gradient(90deg, #fffbe6 0%, #ffe0e0 100%)",
                              boxShadow: "0 2px 8px rgba(255, 193, 7, 0.15)",
                              transition: "background 0.3s",
                            }
                            : {}
                        }
                      >
                        <TableCell>
                          {formatDate(detail.date)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge sx={{ backgroundColor: "#0046f61a" }}>
                            {detail.workingHours}
                          </StatusBadge>
                        </TableCell>
                        <TableCell sx={{ color: "#0046f6", fontWeight: 500 }}>
                          {detail.punchIn}
                        </TableCell>
                        <TableCell
                          sx={{ color: "error.main", fontWeight: 500 }}
                        >
                          {detail.punchOut ? detail.punchOut : "---"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={detail.status.toLowerCase()}>
                            {detail.status}
                          </StatusBadge>
                          {loggedInUser?.role !== "admin" &&
                            effectiveSelectedEmployee &&
                            detail.status.toLowerCase() !== "punch-out" &&
                            (detail.status
                              .toLowerCase()
                              .includes("inprogress") ||
                              detail.status
                                .toLowerCase()
                                .includes("missed punchout")) && (
                              <IconButton
                                size="small"
                                sx={{ ml: 1 }}
                                onClick={() =>
                                  handlePunchCorrectionClick(
                                    detail,
                                    "punch-out"
                                  )
                                }
                              >
                                <FileX2 size={18} color="#d32f2f" />
                              </IconButton>
                            )}
                          {loggedInUser?.role === "user" &&
                            effectiveSelectedEmployee &&
                            !detail.status
                              .toLowerCase()
                              .includes("inprogress") &&
                            !detail.status
                              .toLowerCase()
                              .includes("missed punchout") &&
                            detail.status.toLowerCase() !== "punch-out" && (
                              <IconButton
                                size="small"
                                sx={{ ml: 1 }}
                                onClick={() =>
                                  handlePunchCorrectionClick(
                                    detail,
                                    "punch-out"
                                  )
                                }
                              >
                                <FileX2 size={18} color="#d32f2f" />
                              </IconButton>
                            )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" sx={{ color: "#888" }}>
                        No attendance records found for this employee between{" "}
                        <strong>
                          {startDate ? formatDate(startDate) : "start"} and{" "}
                          {endDate ? formatDate(endDate) : "end"}
                        </strong>
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        )}
      </CardContent>
    
    </Card>
  );
};

{
  /*****************************Main  Attendance Components *************************************/
}
const Attendance = () => {
  const [getAttendance, { data: attendanceData, isLoading }] =
    useGetAttendanceMutation();
  const { selectedEmployee } = useEmployee();
  const { data: locationSettings } = useGetLocationQuery();
  // ...socket.io logic removed...

  const [showLateOnly, setShowLateOnly] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [dateRange, setDateRange] = React.useState([null, null]);
  const [startDate, endDate] = dateRange;

  const loggedInUser = React.useMemo(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }, []);

  const effectiveSelectedEmployee = React.useMemo(() => {
    if (loggedInUser?.role === "user") return loggedInUser._id;
    return selectedEmployee;
  }, [loggedInUser, selectedEmployee]);

  React.useEffect(() => {
    if (loggedInUser) console.log("Logged-in User ID:", loggedInUser._id);
    else console.log("No logged-in user found in localStorage.");
    console.log("Effective Selected Employee ID:", effectiveSelectedEmployee);
  }, [loggedInUser, effectiveSelectedEmployee]);

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours);
    if (hours === 12) hours = modifier === "PM" ? 12 : 0;
    else if (modifier === "PM") hours = hours + 12;
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  const filteredAttendanceData = React.useMemo(() => {
    if (!attendanceData?.responseData?.attendanceDetails) return [];
    let filtered = attendanceData.responseData.attendanceDetails;
    const now = new Date(),
      currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1),
      currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (startDate && endDate) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.date);
        const startDateOnly = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          0,
          0,
          0,
          0
        );
        const endDateOnly = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate(),
          23,
          59,
          59,
          999
        );
        return recordDate >= startDateOnly && recordDate <= endDateOnly;
      });
    } else {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= currentMonthStart && recordDate <= currentMonthEnd;
      });
    }

    if (showLateOnly) {
      const punchOutReferenceTime =
        locationSettings?.data?.punchOutTime || null;
      if (punchOutReferenceTime) {
        filtered = filtered.filter((record) =>
          isLateCheckIn(record.punchIn, null, punchOutReferenceTime)
        );
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatDate(record.date)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [
    attendanceData,
    showLateOnly,
    searchTerm,
    startDate,
    endDate,
    locationSettings,
  ]);

  const sortedAttendanceData = React.useMemo(() => {
    if (!filteredAttendanceData) return [];
    return [...filteredAttendanceData].sort((a, b) => {
      const timeA = convertTo24Hour(a.punchIn),
        timeB = convertTo24Hour(b.punchIn);
      return timeA.localeCompare(timeB);
    });
  }, [filteredAttendanceData]);

  useEffect(() => {
    if ((startDate && endDate) || (startDate === null && endDate === null)) {
      const fetchAttendance = async () => {
        try {
          const payload = {};
          if (effectiveSelectedEmployee)
            payload.userId = effectiveSelectedEmployee;
          const sDate = startDate,
            eDate = endDate;
          if (sDate && eDate) {
            const formatDate = (date, isEnd = false) => {
              const d = new Date(date);
              if (isEnd) d.setHours(23, 59, 59, 999);
              return d.toISOString().slice(0, 10);
            };
            payload.startDate = formatDate(sDate);
            payload.endDate = formatDate(eDate, true);
          }
          console.log("Attendance API payload:", payload);
          await getAttendance(payload);
        } catch (error) { }
      };
      fetchAttendance();
    }
  }, [effectiveSelectedEmployee, getAttendance, startDate, endDate]);

  const attendanceRecords =
    attendanceData?.responseData?.attendanceDetails || [];
  const name = attendanceData ? attendanceData?.responseData?.name : "";

  const stats = React.useMemo(() => {
    if (!attendanceData) return {};
    if (effectiveSelectedEmployee) {
      const { presentDays = 0, leaveDays = 0, totalWorkingHours = "0h 0m" } = 
      attendanceData?.responseData || {};

return { presentDays, leaveDays, totalWorkingHours };

    }
    const isSingleDay =
      attendanceData?.responseData?.dateRange?.startDate ===
      attendanceData?.responseData?.dateRange?.endDate;
    return {
      totalEmployees: attendanceData?.responseData?.totalEmployees || 0,
      workingDays: getWorkingDaysInCurrentMonth(),
      presentToday: isSingleDay
        ? attendanceData?.responseData?.presentInRange || 0
        : attendanceData?.responseData?.presentInRange || 0,
      presentDays: attendanceData?.responseData?.presentInRange || 0,
    };
  }, [attendanceData, effectiveSelectedEmployee]);

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "info",
  });
  const handleSnackbarClose = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  React.useEffect(() => {
    if (effectiveSelectedEmployee && showLateOnly) {
      const now = new Date(),
        start = new Date(now.getFullYear(), now.getMonth(), 1),
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDateRange([start, end]);
    }
  }, [effectiveSelectedEmployee, showLateOnly]);

  if (isLoading || attendanceData === undefined) {
    return (
      <LoaderContainer>
        <CustomLoader />
      </LoaderContainer>
    );
  }

  return (
    <Container>
      <StatsGrid>
        {effectiveSelectedEmployee ? (
          <>
            <StatCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <IconWrapper sx={{ backgroundColor: "#e2dff7" }}>
                    <Calendar1 size={24} color="#8e83f2" />
                  </IconWrapper>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--textColor)" }}
                    >
                      Present Days of Month
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: "var(--textColor)" }}
                    >
                      {stats.presentDays}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
            <StatCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <IconWrapper sx={{ backgroundColor: "var(--redShadeBg)" }}>
                    <Users2 size={24} color="#197743" />
                  </IconWrapper>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--textColor)" }}
                    >
                      Leave Days of Month
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: "var(--textColor)" }}
                    >
                      {stats.leaveDays}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
            <StatCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <IconWrapper sx={{ backgroundColor: "var(--yellowShadeBg)" }}>
                    <Clock1 size={24} color="var(--yellowShadeColor)" />
                  </IconWrapper>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--textColor)" }}
                    >
                      Total Working Hours
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: "var(--textColor)" }}
                    >
                      {stats.totalWorkingHours}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
          </>
        ) : (
          <>
            <StatCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <IconWrapper sx={{ backgroundColor: "var(--redShadeBg)" }}>
                    <Users2 size={24} color="#197743" />
                  </IconWrapper>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--textColor)" }}
                    >
                      Total Employees
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: "var(--textColor)" }}
                    >
                      {stats.totalEmployees}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
            <StatCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <IconWrapper sx={{ backgroundColor: "var(--greenShadeBg)" }}>
                    <Calendar1 size={24} color="var(--greenShadeColor)" />
                  </IconWrapper>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--textColor)" }}
                    >
                      Present Today
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: "var(--textColor)" }}
                    >
                      {stats.presentToday}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
            <StatCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <IconWrapper sx={{ backgroundColor: "var(--yellowShadeBg)" }}>
                    <Clock1 size={24} color="var(--yellowShadeColor)" />
                  </IconWrapper>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--textColor)" }}
                    >
                      Working Days of Month
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: "var(--textColor)" }}
                    >
                      {stats.workingDays}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
          </>
        )}
      </StatsGrid>

      {effectiveSelectedEmployee ? (
        <SingleEmployeeAttendance
          attendanceData={attendanceRecords}
          name={name}
          effectiveSelectedEmployee={effectiveSelectedEmployee}
          getAttendance={getAttendance}
          dateRange={dateRange}
          setDateRange={setDateRange}
          loggedInUser={loggedInUser}
          showSnackbar={(message, severity = "info") =>
            setSnackbar({ open: true, message, severity })
          }
          locationSettings={locationSettings}
        />
      ) : (
        !effectiveSelectedEmployee && (
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              overflow: "visible",
              background: "#fff",
              mb: 3,
              minHeight: "calc(100vh - 260px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardHeader
              sx={{
                px: 3,
                py: 3,
                backgroundColor: "transparent",
                boxShadow: "none",
              }}
              title={
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Users2 size={24} color="var(--textColor)" />
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        color: "var(--textColor)",
                        fontSize: "22px",
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      All Employees Attendance Log
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Box sx={{ minWidth: 220 }}>
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
                          width: "100%",
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
                          "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline":
                          {
                            borderColor:
                              "var(--textFieldFocusBorderColor, #343a40)",
                            borderWidth: 1,
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 200, position: "relative" }}>
                      <DatePicker
                        selectsRange={true}
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
                                borderColor:
                                  "var(--textFieldBorderColor, #ced4da)",
                                borderRadius: "12px",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor:
                                  "var(--textFieldBorderColor, #ced4da)",
                              },
                              "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline":
                              {
                                borderColor:
                                  "var(--textFieldFocusBorderColor, #343a40)",
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
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={showLateOnly}
                            onChange={(e) => setShowLateOnly(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <span
                            style={{
                              color: "var(--primaryColor)",
                              fontWeight: 500,
                              fontSize: "14px",
                            }}
                          >
                            Late Check-ins
                          </span>
                        }
                        sx={{
                          whiteSpace: "nowrap",
                          margin: 0,
                          alignItems: "center",
                          height: "40px",
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              }
            />

            <CardContent
              sx={{
                pt: 0,
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {!filteredAttendanceData.length &&
                attendanceData !== undefined ? (
                <NoRecordsMessage sx={{ flexGrow: 1 }}>
                  <NoRecordsIcon>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1.5,
                        opacity: 0.8,
                      }}
                    >
                      <Database size={24} color="#757575" />
                    </Box>
                  </NoRecordsIcon>
                  <Typography
                    variant="body1"
                    sx={{ color: "#666", fontStyle: "italic" }}
                  >
                    No attendance records found matching your search criteria
                  </Typography>
                </NoRecordsMessage>
              ) : (
                <Box
                  sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    maxHeight: "calc(100vh - 420px)",
                    paddingRight: "8px",
                    overflowX: "hidden",
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "#f1f1f1",
                      borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#c1c1c1",
                      borderRadius: "10px",
                      "&:hover": {
                        background: "#a8a8a8",
                      },
                    },
                  }}
                >
                  {Object.entries(
                    filteredAttendanceData.reduce((acc, row) => {
                      const date = formatDate(row.date).split(",")[0];
                      if (!acc[date]) acc[date] = [];
                      acc[date].push(row);
                      return acc;
                    }, {})
                  )
                    .sort(([dateA], [dateB]) => {
                      const [dA, mA, yA] = dateA.split("-").map(Number);
                      const [dB, mB, yB] = dateB.split("-").map(Number);
                      return (
                        new Date(yB, mB - 1, dB) - new Date(yA, mA - 1, dA)
                      );
                    })
                    .map(([date, rows]) => (
                      <Card
                        key={date}
                        sx={{
                          width: "100%",
                          borderRadius: 2,
                          boxShadow:
                            "var(--cardBoxShadow, 0 2px 10px rgba(0,0,0,0.03))",
                          padding: 2,
                          marginBottom: 2,
                          marginTop: 1,
                          marginLeft: "1px",
                          backgroundColor: "#fff",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            textAlign: "left",
                            backgroundColor:
                              "var(--tableHeaderBackgroundColor)",
                            color: "black",
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                          }}
                        >
                          {formatDate(rows[0].date)}
                        </Typography>
                        <Table
                          size="small"
                          aria-label={`attendance for ${date}`}
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Name
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Working Hours
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Punch In
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Punch Out
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Status
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((record, idx) => {
                              const isLate = isLateCheckIn(
                                record.punchIn,
                                null,
                                locationSettings?.data?.punchOutTime || null
                              );
                              return (
                                <TableRow
                                  key={idx}
                                  sx={
                                    isLate
                                      ? {
                                        background:
                                          "linear-gradient(90deg, #fffbe6 0%, #ffe0e0 100%)",
                                        boxShadow:
                                          "0 2px 8px rgba(255, 193, 7, 0.15)",
                                        transition: "background 0.3s",
                                      }
                                      : {}
                                  }
                                >
                                  <TableCell sx={{ fontWeight: 500 }}>
                                    {record.name}
                                    {false ? (
                                      <span
                                        style={{
                                          marginLeft: 8,
                                          padding: "2px 8px",
                                          backgroundColor:
                                            "var(--backgroundColor, #EFEFEF)",
                                          color: "var(--textColor, #191919)",
                                          borderRadius: "8px",
                                          fontWeight: 600,
                                          fontSize: "0.75rem",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          height: "22px",
                                          minWidth: "40px",
                                          verticalAlign: "middle",
                                        }}
                                      >
                                        RW
                                      </span>
                                    ) : (
                                      <span
                                        style={{
                                          display: "inline-block",
                                          height: "22px",
                                          minWidth: "40px",
                                        }}
                                      ></span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <StatusBadge>
                                      {record.workingHours}
                                    </StatusBadge>
                                  </TableCell>
                                  <TableCell
                                    sx={{ color: "#0046f6", fontWeight: 500 }}
                                  >
                                    {record.punchIn}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color: "error.main",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {record.punchOut ? record.punchOut : "---"}
                                  </TableCell>
                                  <TableCell>
                                    <StatusBadge
                                      status={record.status.toLowerCase()}
                                    >
                                      {record.status}
                                    </StatusBadge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </Card>
                    ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
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
    </Container>
  );
};

export default Attendance;
