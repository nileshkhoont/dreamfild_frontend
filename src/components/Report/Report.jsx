import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  styled,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  useTheme,
  Container as MuiContainer,
  Chip,
  Fade,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Download,
  Calendar,
  FileSpreadsheet,
  CalendarRange,
  AlertTriangle,
  ChevronDown,
  Calendar as Calendar1,
  User,
  CalendarDays,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  useDownloadReportMutation,
  useAttendanceReportMutation,
} from "./../../apiService";
import { useEmployee } from "../../utils/EmployeeContext";
import { format } from "date-fns";
import ContentLoader from "react-content-loader";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const truncateText = (text, maxLength = 20) => {
  if (!text || text === "-") return "-";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

const Container = styled(Box)({
  // maxWidth: 1400,
  margin: "0 auto",
  paddingTop: "2rem",

});

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  overflow: "visible",
}));

const CardHeaderStyled = styled(CardHeader)(({ theme }) => ({
  paddingBottom: 0,
  "& .MuiCardHeader-title": {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
}));

const DownloadButton = styled(Button)(({ theme }) => ({
  borderRadius: 2, // 8px border radius to match Register and input fields
  padding: theme.spacing(1, 2),
  textTransform: "none",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
    backgroundColor: "white",
  color: "var(--purpleShadeBg)",
  boxShadow: "none",
  minWidth: "120px",
  transition: "background 0.2s, color 0.2s",
  "&:hover": {
   boxShadow: "none",
  },
}));

const DatePickerWrapper = styled(Paper)(({ theme }) => ({
  padding: `0 ${theme.spacing(2)}`,
  borderRadius: 10,

  background: "#ffffff",
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: 10,
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
  backgroundColor: "",
  "& .MuiTableCell-head": {
    // backgroundColor removed for transparent header
    fontWeight: 600,
    padding: theme.spacing(1.5, 2),
    color: "var(--textColor)",
  },
  "& .MuiTableCell-body": {
    padding: theme.spacing(1.5, 2),
    color: "var(--textColor)",
  },
  // Remove background from table rows
  "& .MuiTableRow-root": {
    transition: "background-color 0.3s ease",
  },
  "& .MuiTableRow-root:hover": {
    backgroundColor: "var(--hoverBackgroundColor)",
    transition: "background-color 0.3s ease",
  },
  minHeight: 300,
}));

// const NoDataWrapper = styled(Box)(({ theme }) => ({
//   display: "flex",
//   flexDirection: "column",
//   alignItems: "center",
//   justifyContent: "center",
//   padding: theme.spacing(4),
//   gap: theme.spacing(1.5),
//   color: theme.palette.text.secondary,
// }));

// const StatusChip = styled(Chip)(({ theme, status }) => {
//   return {
//     fontWeight: 500,
//     textTransform: "capitalize",
//     height: "24px",
//   };
// });

// const ResetButton = styled(Button)(({ theme }) => ({
//   borderRadius: 8,

//   textTransform: "none",
//   fontWeight: 500,

// }));

const TableRowLoader = () => (
  <ContentLoader
    speed={2}
    width="100%"
    height={18}
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    style={{ borderRadius: "4px" }}
  >
    <rect x="0" y="0" rx="3" ry="3" width="100%" height="40" />
  </ContentLoader>
);
const TableHeaderLoader = () => (
  <ContentLoader
    speed={2}
    width="100%"
    height={18}
    backgroundColor="#dee2e6"
    foregroundColor="#e8edfd"
    style={{ borderRadius: "4px", marginBottom: "0px" }}
  >
    <rect x="0" y="0" rx="0" ry="0" width="100%" height="18" />
  </ContentLoader>
);

const DateRangeButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(0.5, 1.5),
  textTransform: "none",
  fontWeight: 500,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: "1px solid var(--textFieldBorderColor, #ced4da)",
  boxShadow: "none",
  height: "40px",
  fontSize: "14px",
  width: "225px", // Added fixed width
  justifyContent: "space-between", // Better spacing for the text and icons
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    borderColor: "black",
    boxShadow: "none",
  },
  "&:focus": {
    borderColor: "var(--textFieldFocusBorderColor, #343a40)",
    boxShadow: "none",
  },
}));

// Add styled component for the menu
const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 8,
    minWidth: 180,
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.15)",
    padding: theme.spacing(1, 0),
  },
  "& .MuiMenuItem-root": {
    padding: theme.spacing(1, 2),
    fontSize: "0.9rem",
    position: "relative",
    transition: "all 0.2s ease",
    "&.Mui-selected": {
      backgroundColor: "rgba(var(--inputBorderColor-rgb), 0.08)",
      fontWeight: 500,
      "&:hover": {
        backgroundColor: "rgba(var(--inputBorderColor-rgb), 0.12)",
      },
      "&::after": {
        content: '""',
        position: "absolute",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        width: 3,
        height: "70%",
        backgroundColor: "var(--inputBorderColor)",
        borderRadius: "0 2px 2px 0",
      },
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

// Add styled component for the divider
const MenuDivider = styled("div")(({ theme }) => ({
  height: 1,
  margin: theme.spacing(0.5, 0),
  backgroundColor: "rgba(0, 0, 0, 0.08)",
}));

const FilterChip = styled(Chip)(({ theme, selected }) => ({
  margin: theme.spacing(0, 0.5),
  fontWeight: 500,
  backgroundColor: selected ? "#d9d9d9" : theme.palette.background.paper,
  border: selected ? "1px solid #d9d9d9" : "1px solid rgba(0, 0, 0, 0.12)",
  "&:hover": {
    backgroundColor: selected ? "#d9d9d9" : theme.palette.action.hover,
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

const Reports = () => {
  const { selectedEmployee, isChangingSelection } = useEmployee();
  const theme = useTheme();

  // Set default date range: start of current month to today
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of month
  const [dateRange, setDateRange] = useState([startOfMonth, endOfMonth]);
  const [startDate, endDate] = dateRange;
  const [activeShortcut, setActiveShortcut] = useState(null);
  const [reportType, setReportType] = useState("all"); // Add report type state with default "all"

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [downloadReport, { isLoading: isDownloading }] =
    useDownloadReportMutation();
  const [attendanceReport, { isLoading: isLoadingReport }] =
    useAttendanceReportMutation();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [reportData, setReportData] = useState(null);

  const isValidDateRange = () => {
    if (startDate === null && endDate === null) {
      return true;
    }
    if ((startDate && !endDate) || (!startDate && endDate)) {
      return false;
    }
    return true;
  };

  // Check if the report data contains the name field (which means no employee is selected)
  // const hasNameField =
  //   reportData && reportData.length > 0 && "name" in reportData[0];

  // Get logged-in user from localStorage
  const loggedInUser = React.useMemo(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }, []);

  // If logged-in user is a normal user, override selectedEmployee
  const effectiveSelectedEmployee =
    loggedInUser?.role === "user" ? loggedInUser?._id : selectedEmployee;

  const handleDownload = async () => {
    if (!isValidDateRange()) {
      setSnackbar({
        open: true,
        message: "Please provide both start and end dates or leave both empty",
        severity: "warning",
      });
      return;
    }

    try {
      const payload = {
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
        endDate: endDate
          ? format(endDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        reportType: reportType,
      };

      if (effectiveSelectedEmployee) {
        payload.userId = effectiveSelectedEmployee;
      }

      // Call the API - the download happens within the API service now
      const response = await downloadReport(payload).unwrap();

      if (response.success) {
        setSnackbar({
          open: true,
          message: "Report downloaded successfully!",
          severity: "success",
        });
      } else if (
        response.statusCode === 200 &&
        response.responseMessage === "No data found for the given period."
      ) {
        setSnackbar({
          open: true,
          message: "No data found for the given period.",
          severity: "info",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to download report",
        severity: "error",
      });
    }
  };

  const fetchReport = async () => {
    setReportData(null);
    try {
      const payload = {
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
        endDate: endDate
          ? format(endDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        reportType: reportType,
      };

      if (effectiveSelectedEmployee) {
        payload.userId = effectiveSelectedEmployee;
      }

      // Call the API
      const response = await attendanceReport(payload).unwrap();

      if (response.statusCode === 200) {
        setReportData(response.responseData);
      } else {
        throw new Error(
          response.responseMessage || "Failed to fetch report data"
        );
      }
    } catch (error) {
      setReportData(null);
      setSnackbar({
        open: true,
        message: "Failed to load attendance report data",
        severity: "error",
      });
    }
  };

  const applyDateShortcut = (shortcutType) => {
    const today = new Date();
    let newStartDate, newEndDate;

    switch (shortcutType) {
      case "today":
        newStartDate = new Date(today);
        newEndDate = new Date(today);
        break;
      case "thisWeek":
        // Set to beginning of current week (Sunday or Monday depending on locale)
        newStartDate = new Date(today);
        newStartDate.setDate(today.getDate() - today.getDay()); // Go to Sunday
        newEndDate = new Date(today);
        break;
      case "lastWeek":
        // Set to beginning of last week
        newStartDate = new Date(today);
        newStartDate.setDate(today.getDate() - today.getDay() - 7); // Go to Sunday of last week
        newEndDate = new Date(today);
        newEndDate.setDate(today.getDate() - today.getDay() - 1); // Go to Saturday of last week
        break;
      case "thisMonth":
        newStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        newEndDate = new Date(today);
        break;
      case "lastMonth":
        newStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        newEndDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "last3Months":
        newStartDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        newEndDate = new Date(today);
        break;
      case "last6Months":
        newStartDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        newEndDate = new Date(today);
        break;
      case "lastYear":
        newStartDate = new Date(
          today.getFullYear() - 1,
          today.getMonth(),
          today.getDate()
        );
        newEndDate = new Date(today);
        break;
      default:
        return;
    }

    setDateRange([newStartDate, newEndDate]);
    setActiveShortcut(shortcutType);
    handleCloseMenu(); // Close the dropdown menu after selection
  };

  // const handleResetDates = () => {
  //   setDateRange([null, null]);
  //   setActiveShortcut(null);
  // };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (startDate === null || endDate === null) {
      setActiveShortcut(null);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    // Clear report data immediately
    setReportData(null);
    // Only fetch if we're not in the middle of a selection change
    if (!isChangingSelection) {
      fetchReport();
    }
  }, [
    effectiveSelectedEmployee,
    startDate,
    endDate,
    isChangingSelection,
    reportType,
  ]);

  return (
    <Fade in={true} timeout={700}>
      <Container
        sx={{
          minHeight: "calc(100vh - 110px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          // backgroundColor:"red"

        }}
      >
        <StyledCard
          sx={{
            minHeight: "calc(100vh - 130px)",
            display: "flex",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            flexDirection: "column",
            //  backgroundColor:"yellow"
          }}
        >
          <CardHeader
            sx={{
              pb: 0,
              pt: 2, // Add padding top
              // mb: -1, // Add negative margin bottom to reduce space
              // backgroundColor:"green"
            }}
            title={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minHeight: 48,
                }}
              >
                <CalendarDays size={22} color="var(--textColor)" />
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
                  {effectiveSelectedEmployee &&
                    reportData &&
                    reportData[0]?.name &&
                    `${reportData[0].name}'s`}{" "}
                  Attendance Reports
                </Typography>
              </Box>
            }
          />
          {/*card content here */}
          <CardContent
            sx={{
              pt: 0, // Increase top padding
              px: 3, // Add horizontal padding
              flex: 1, // Ensures content stretches within the card
            }}
          >
            <Box sx={{ mb: 2 }}>
              {/* Add margin bottom to the Box */}
              <Grid container spacing={2} alignItems="center">
                {/* Filter Section */}
                <Grid item xs={12} md="auto">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,

                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500, color: "text.secondary", fontSize: "18px" }}
                    >
                      Filter by:
                    </Typography>
                    <FilterChip
                      label="All"
                      selected={reportType === "all"}
                      onClick={() => setReportType("all")}
                      sx={{ px: 1, py: 1, height: "40px", fontWeight: 500, borderRadius: 3, fontSize: "14px" }}
                    />
                    <FilterChip
                      label="Attendance"
                      selected={reportType === "attendance"}
                      onClick={() => setReportType("attendance")}
                      sx={{ px: 1, py: 1, height: "40px", fontWeight: 500, borderRadius: 3, fontSize: "14px" }}
                    />
                    <FilterChip
                      label="Leave"
                      selected={reportType === "leave"}
                      onClick={() => setReportType("leave")}
                      sx={{ px: 1, py: 1, height: "40px", fontWeight: 500, borderRadius: 3, fontSize: "14px" }}
                    />
                  </Box>
                </Grid>

                {/* Date Range Buttons + Picker */}
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "",
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      {/* Date Range Shortcut Button */}
                      <Box sx={{ position: "relative", width: "225px" }}>
                        <DateRangeButton
                          id="date-range-button"
                          aria-controls={open ? "date-range-menu" : undefined}
                          aria-haspopup="true"
                          aria-expanded={open ? "true" : undefined}
                          variant="outlined"
                          onClick={handleOpenMenu}
                          endIcon={<ChevronDown size={16} />}
                          startIcon={<CalendarRange size={16} />}
                          sx={{
                            borderRadius: 3,
                            zIndex: 1,
                            width: "100%",
                            "& .MuiButton-endIcon": { ml: 1 },
                            "& .MuiButton-startIcon": { mr: 1 },
                          }}
                        >
                          {activeShortcut
                            ? {
                              today: "Today",
                              thisWeek: "This Week",
                              lastWeek: "Last Week",
                              thisMonth: "This Month",
                              lastMonth: "Last Month",
                              last3Months: "Last 3 Months",
                              last6Months: "Last 6 Months",
                              lastYear: "Last Year",
                            }[activeShortcut] || "Date Range"
                            : "Date Range"}
                        </DateRangeButton>

                        {/* Date Range Menu */}
                        <StyledMenu
                          id="date-range-menu"
                          anchorEl={anchorEl}
                          open={open}
                          onClose={handleCloseMenu}
                          MenuListProps={{
                            "aria-labelledby": "date-range-button",
                            dense: true,
                          }}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                          }}
                          TransitionProps={{ enter: true, exit: false }}
                          sx={{
                            "& .MuiBackdrop-root": {
                              backgroundColor: "transparent",
                            },
                            "& .MuiPaper-root": {
                              position: "absolute",
                              zIndex: 1300,
                            },
                          }}
                        >
                          <MenuItem
                            onClick={() => applyDateShortcut("today")}
                            selected={activeShortcut === "today"}
                          >
                            Today
                          </MenuItem>
                          <MenuItem
                            onClick={() => applyDateShortcut("thisWeek")}
                            selected={activeShortcut === "thisWeek"}
                          >
                            This Week
                          </MenuItem>
                          <MenuItem
                            onClick={() => applyDateShortcut("lastWeek")}
                            selected={activeShortcut === "lastWeek"}
                          >
                            Last Week
                          </MenuItem>
                          <MenuDivider />
                          <MenuItem
                            onClick={() => applyDateShortcut("thisMonth")}
                            selected={activeShortcut === "thisMonth"}
                          >
                            This Month
                          </MenuItem>
                          <MenuItem
                            onClick={() => applyDateShortcut("lastMonth")}
                            selected={activeShortcut === "lastMonth"}
                          >
                            Last Month
                          </MenuItem>
                          <MenuItem
                            onClick={() => applyDateShortcut("last3Months")}
                            selected={activeShortcut === "last3Months"}
                          >
                            Last 3 Months
                          </MenuItem>
                          <MenuItem
                            onClick={() => applyDateShortcut("last6Months")}
                            selected={activeShortcut === "last6Months"}
                          >
                            Last 6 Months
                          </MenuItem>
                          <MenuItem
                            onClick={() => applyDateShortcut("lastYear")}
                            selected={activeShortcut === "lastYear"}
                          >
                            Last Year
                          </MenuItem>
                        </StyledMenu>
                      </Box>

                      {/* Date Picker Input */}
                      <DatePicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => setDateRange(update)}
                        isClearable
                        placeholderText="Select date range"
                        dateFormat="dd/MM/yyyy"
                        customInput={
                          <TextField
                            size="small"
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Calendar
                                    size={16}
                                    color={theme.palette.text.secondary}
                                  />
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
                  </LocalizationProvider>
                </Grid>

                {/* Export Button */}
                <Grid item xs={12} md="auto" sx={{ ml: "auto" }}>
                  <Tooltip
                    title="Download in Excel format"
                    arrow
                    placement="left"
                  >
                    <DownloadButton
                      variant="contained"
                      color="primary"
                      onClick={handleDownload}
                      disabled={isDownloading}
                      fullWidth
                      size="medium"
                      sx={{
                        backgroundColor: "white",
                        color: "var(--purpleShadeBg)",
                        borderRadius: "5px",
                        fontWeight: 600,
                        boxShadow: "none",
                        minWidth: "120px",
                        mr: 0,
                        ml: "auto",
                      }}
                    >
                      {isDownloading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <>
                          <Download size={18} />
                          Export
                        </>
                      )}
                    </DownloadButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Box>

            {/* Attendance Report Table */}
            {isLoadingReport || reportData === null || isChangingSelection ? (
              <StyledTableContainer component={Paper}>
                <Table size="small" aria-label="attendance report table">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={8}>
                        <TableHeaderLoader />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...Array(5)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={8}>
                          <TableRowLoader />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            ) : reportData && reportData.length > 0 ? (
              effectiveSelectedEmployee ? (
                <StyledTableContainer
                  component={Paper}
                  selectedEmployee={!!effectiveSelectedEmployee}
                  sx={{
                    width: "100%",
                    height: "calc(100vh - 280px)", // Adjust as needed
                    maxHeight: "calc(100vh - 280px)",
                    overflow: "hidden", // Critical for proper scroll
                  }}
                >
                  {/* Fixed Header Table */}
                  <Table size="small" sx={{ tableLayout: "auto", minWidth: 650, width: "100%" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{
                          backgroundColor: effectiveSelectedEmployee ? "var(--tableHeaderBackgroundColor)" : "transparent",
                          fontWeight: 600,
                          minWidth: 100
                        }}>
                          Date
                        </TableCell>
                        {(reportType === "all" || reportType === "attendance") && (
                          <TableCell sx={{
                            backgroundColor: effectiveSelectedEmployee ? "var(--tableHeaderBackgroundColor)" : "transparent",
                            fontWeight: 600,
                            minWidth: 100
                          }}>
                            Punch In
                          </TableCell>
                        )}
                        {(reportType === "all" || reportType === "attendance") && (
                          <TableCell sx={{
                            backgroundColor: effectiveSelectedEmployee ? "var(--tableHeaderBackgroundColor)" : "transparent",
                            fontWeight: 600,
                            minWidth: 100
                          }}>
                            Punch Out
                          </TableCell>
                        )}
                        {(reportType === "all" || reportType === "attendance") && (
                          <TableCell sx={{
                            backgroundColor: effectiveSelectedEmployee ? "var(--tableHeaderBackgroundColor)" : "transparent",
                            fontWeight: 600,
                            minWidth: 100
                          }}>
                            Total Hours
                          </TableCell>
                        )}
                        {(reportType === "all" || reportType === "leave") && (
                          <TableCell sx={{
                            backgroundColor: effectiveSelectedEmployee ? "var(--tableHeaderBackgroundColor)" : "transparent",
                            fontWeight: 600,
                            minWidth: 120
                          }}>
                            Leave Type
                          </TableCell>
                        )}
                        {reportType === "leave" && (
                          <TableCell sx={{
                            backgroundColor: effectiveSelectedEmployee ? "var(--tableHeaderBackgroundColor)" : "transparent",
                            fontWeight: 600,
                            minWidth: 80
                          }}>
                            Days
                          </TableCell>
                        )}
                        {(reportType === "all" || reportType === "leave") && (
                          <TableCell sx={{
                            backgroundColor: effectiveSelectedEmployee ? "var(--tableHeaderBackgroundColor)" : "transparent",
                            fontWeight: 600,
                            minWidth: 120
                          }}>
                            Leave Reason
                          </TableCell>
                        )}
                        {(reportType === "all" || reportType === "leave") && (
                          <TableCell sx={{
                            backgroundColor: effectiveSelectedEmployee ? "var(--tableHeaderBackgroundColor)" : "transparent",
                            fontWeight: 600,
                            minWidth: 100
                          }}>
                            Status
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                  </Table>

                  {/* Scrollable Body */}
                  <Box sx={{
                    height: "calc(100vh - 330px)", // 50px less than container
                    maxHeight: "calc(100vh - 330px)",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}>
                    <Table size="small" sx={{ minWidth: 650, width: "100%" }}>
                      <TableBody>
                        {reportData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {row.date || "-"}
                              {row.isWorkFromHome && (
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
                                  RW
                                </span>
                              )}
                            </TableCell>
                            {(reportType === "all" || reportType === "attendance") && (
                              <TableCell>{row.punchIn || "-"}</TableCell>
                            )}
                            {(reportType === "all" || reportType === "attendance") && (
                              <TableCell>{row.punchOut || "-"}</TableCell>
                            )}
                            {(reportType === "all" || reportType === "attendance") && (
                              <TableCell>{row.totalHours || "-"}</TableCell>
                            )}
                            {(reportType === "all" || reportType === "leave") && (
                              <TableCell>
                                {row.leaveType !== "-" && row.leaveType !== "N/A"
                                  ? row.leaveType
                                  : "-"}
                              </TableCell>
                            )}
                            {reportType === "leave" && (
                              <TableCell>
                                {row.leaveTypeCounts && row.leaveTypeCounts.length > 0
                                  ? row.leaveTypeCounts
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
                            )}
                            {(reportType === "all" || reportType === "leave") && (
                              <TableCell>
                                {row.leaveReason !== "-" && row.leaveReason !== "N/A"
                                  ? truncateText(row.leaveReason, 14)
                                  : "-"}
                              </TableCell>
                            )}
                            {(reportType === "all" || reportType === "leave") && (
                              <TableCell>
                                {row.leaveStatus !== "-" && row.leaveStatus !== "N/A" ? (
                                  <StatusBadge status={row.leaveStatus?.toLowerCase()}>
                                    {row.leaveStatus}
                                  </StatusBadge>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </StyledTableContainer>
              ) : (
                // Show cards when selectedEmployee is not present
                <Box sx={{
                  height: "calc(100vh - 50px)", // Set fixed height for scrollable area
                  maxHeight: "calc(100vh - 272px)",
                  overflowY: "auto", // Enable vertical scrolling
                  overflowX: "hidden", // Hide horizontal scroll
                  paddingRight: "8px", // Add padding for scrollbar space
                  marginRight: "-5px", // Compensate for padding
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(0,0,0,0.1)",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "rgba(0,0,0,0.5)",
                  },
                }}>
                  {Object.entries(
                    reportData.reduce((acc, row) => {
                      const date = row.date;
                      if (!acc[date]) acc[date] = [];
                      acc[date].push(row);
                      return acc;
                    }, {})
                  )
                    .filter(([date]) => {
                      // Parse 'DD-MM-YY' to a Date object
                      const [day, month, year] = date.split("-");
                      // Assume year is 20YY (e.g., '25' -> 2025)
                      const cardDate = new Date(
                        `20${year}`,
                        Number(month) - 1,
                        Number(day)
                      );
                      const today = new Date();
                      cardDate.setHours(0, 0, 0, 0);
                      today.setHours(0, 0, 0, 0);
                      return cardDate <= today;
                    })
                    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                    .map(([date, rows]) => (
                      <Card
                        key={date}
                        sx={{
                          width: "100%",
                          borderRadius: 2,
                          boxShadow: "var(--cardBoxShadow)",
                          padding: 2,
                          marginTop: 1,
                          marginBottom: 2,
                          marginLeft: "1px",
                          backgroundColor: "#fff",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            textAlign: "left",
                            backgroundColor: "var(--tableHeaderBackgroundColor)",
                            color: "black",
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                          }}
                        >
                          {date}
                          {" - "}
                          {(() => {
                            // Parse DD-MM-YY or DD-MM-YYYY
                            const [day, month, year] = date.split("-");
                            const jsYear = year.length === 2 ? `20${year}` : year;
                            const jsDate = new Date(`${jsYear}-${month}-${day}`);
                            return jsDate.toLocaleDateString("en-US", { weekday: "long" });
                          })()}
                        </Typography>

                        {/*Day */}
                        <Table
                          size="small"
                          aria-label={`attendance report for ${date}`}
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                              {(reportType === "all" ||
                                reportType === "attendance") && (
                                  <TableCell sx={{ fontWeight: 600 }}>
                                    Punch In
                                  </TableCell>
                                )}
                              {(reportType === "all" ||
                                reportType === "attendance") && (
                                  <TableCell sx={{ fontWeight: 600 }}>
                                    Punch Out
                                  </TableCell>
                                )}
                              {(reportType === "all" ||
                                reportType === "attendance") && (
                                  <TableCell sx={{ fontWeight: 600 }}>
                                    Total Hours
                                  </TableCell>
                                )}
                              {(reportType === "all" ||
                                reportType === "leave") && (
                                  <TableCell sx={{ fontWeight: 600 }}>
                                    Leave Type
                                  </TableCell>
                                )}
                              {reportType === "leave" && (
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Days
                                </TableCell>
                              )}
                              {(reportType === "all" ||
                                reportType === "leave") && (
                                  <TableCell sx={{ fontWeight: 600 }}>
                                    Leave Reason
                                  </TableCell>
                                )}
                              {(reportType === "all" ||
                                reportType === "leave") && (
                                  <TableCell sx={{ fontWeight: 600 }}>
                                    Status
                                  </TableCell>
                                )}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((row, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {row.name || "-"}
                                  {row.isWorkFromHome ? (
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
                                        display: "inline-block",
                                        height: 22,
                                        verticalAlign: "middle",
                                      }}
                                    >
                                      RW
                                    </span>
                                  ) : null}
                                </TableCell>

                                {(reportType === "all" ||
                                  reportType === "attendance") && (
                                    <TableCell>{row.punchIn || "-"}</TableCell>
                                  )}
                                {(reportType === "all" ||
                                  reportType === "attendance") && (
                                    <TableCell>{row.punchOut || "-"}</TableCell>
                                  )}
                                {(reportType === "all" ||
                                  reportType === "attendance") && (
                                    <TableCell>{row.totalHours || "-"}</TableCell>
                                  )}
                                {(reportType === "all" ||
                                  reportType === "leave") && (
                                    <TableCell>
                                      {row.leaveType !== "-" &&
                                        row.leaveType !== "N/A" ? (
                                        <span
                                          style={{
                                            display: "block",
                                            textAlign: "left",
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontWeight: 500,
                                              display: "block",
                                            }}
                                          >
                                            {row.leaveType}
                                          </span>
                                          <span
                                            style={{
                                              fontSize: "0.85rem",
                                              color: "#666",
                                              display: "block",
                                            }}
                                          >
                                            {row?.startDate} - {row?.endDate}
                                          </span>
                                        </span>
                                      ) : (
                                        "-"
                                      )}
                                    </TableCell>
                                  )}

                                {reportType === "leave" && (
                                  <TableCell>
                                    {row.leaveTypeCounts &&
                                      row.leaveTypeCounts.length > 0
                                      ? row.leaveTypeCounts
                                        .filter((lc) => lc.count > 0)
                                        .map((lc) => {
                                          if (lc.type === "First-half")
                                            return `${lc.count}FH`;
                                          if (lc.type === "Second-half")
                                            return `${lc.count}SH`;
                                          if (lc.type === "Full-day")
                                            return `${lc.count}D`;
                                          return null;
                                        })
                                        .filter(Boolean)
                                        .join(" ")
                                      : "-"}
                                  </TableCell>
                                )}

                                {(reportType === "all" ||
                                  reportType === "leave") && (
                                    <TableCell>
                                      {row.leaveReason !== "-" &&
                                        row.leaveReason !== "N/A"
                                        ? truncateText(row.leaveReason, 14)
                                        : "-"}
                                    </TableCell>
                                  )}
                                {(reportType === "all" ||
                                  reportType === "leave") && (
                                    <TableCell>
                                      {row.leaveStatus !== "-" &&
                                        row.leaveStatus !== "N/A" ? (
                                        <StatusBadge
                                          status={row.leaveStatus?.toLowerCase()}
                                        >
                                          {row.leaveStatus}
                                        </StatusBadge>
                                      ) : (
                                        "-"
                                      )}
                                    </TableCell>
                                  )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    ))}
                </Box>
              )
            ) : (
              // Fallback when no data is available
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  py: 9,
                }}
              >
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
                  <CalendarDays size={24} color="#757575" />
                </Box>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight={500}
                >
                  No attendance data to display
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  Please select a different date range
                </Typography>
              </Box>
            )}
          </CardContent>
        </StyledCard>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              bgcolor: snackbar.severity === "success" ? "#eaf2ea" : undefined,
              color: snackbar.severity === "success" ? "#2e7d32" : undefined,
              fontWeight: 500,
              fontSize: "1rem",
              borderRadius: 2,
              boxShadow: "none",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Fade>
  );
};

export default Reports;
