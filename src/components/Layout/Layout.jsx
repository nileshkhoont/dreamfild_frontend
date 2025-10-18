import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  alpha,
  IconButton,
  Button,
  Avatar,
  ListItemAvatar,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Outlet, useNavigate, useLocation  } from "react-router-dom";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";
import { useGetUsersQuery } from "../../apiService";
import { useEmployee } from "../../utils/EmployeeContext";
import { Skeleton } from "@mui/material";
import { PersonOffOutlined } from "@mui/icons-material";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GroupIcon from "@mui/icons-material/Group";
import CloseIcon from "@mui/icons-material/Close";



const EmployeeList = ({ isMobile, isDrawerOpen, onDrawerClose, setSidebarOpenParent }) => {
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

  // Hide employee list if role is 'user' or 'super-admin'
  if (loggedInUser?.role === "user" || loggedInUser?.role === "super-admin") {
    return null;
  }

  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: employeesResponse,
    refetch,
    isLoading: employeesLoading,
  } = useGetUsersQuery();

  const employees = employeesResponse?.responseData?.data || [];
  const { selectedEmployee, toggleEmployeeSelection } = useEmployee();
  const navigate = useNavigate();

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReset = () => {
    setSearchQuery("");
    if (selectedEmployee) {
      toggleEmployeeSelection(selectedEmployee);
    }
  };

  const handleEmployeeSelect = (employeeId) => {
    toggleEmployeeSelection(employeeId);

    setTimeout(() => {
      onDrawerClose();
      if (setSidebarOpenParent) setSidebarOpenParent("Attendance"); // Expand Attendance menu
      navigate("/attendance");
    }, 300);
  };
// const [sidebarOpenParent, setSidebarOpenParent] = useState(null);
  useEffect(() => {
    refetch();
  }, [refetch]);

  const LoadingSkeleton = () => (
    <List sx={{ p: 1 }}>
      {[1, 2, 3, 4].map((item) => (
        <React.Fragment key={item}>
          <ListItem sx={{ borderRadius: 2, mb: 0.5 }}>
            <ListItemText
              primary={
                <Skeleton
                  width="80%"
                  height={24}
                  sx={{ bgcolor: "#343a40", opacity: 0.18 }}
                />
              }
              secondary={
                <Skeleton
                  width="60%"
                  height={20}
                  sx={{ bgcolor: "#343a40", opacity: 0.12 }}
                />
              }
            />
          </ListItem>
          <Divider variant="inset" component="li" sx={{ my: 0.5 }} />
        </React.Fragment>
      ))}
    </List>
  );

  const employeeListContent = (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2.5,
          position: "sticky",
          top: 0,
          bgcolor: (theme) => theme.palette.primary.contrastText,
          borderBottom: 1,
          borderColor: "divider",
          zIndex: 1,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: "1.1rem",
            fontWeight: 600,
            letterSpacing: "0.5px",
            color: "var(--textColor)",
          }}
        >
          Employees
        </Typography>
        {isMobile && (
          <IconButton
            onClick={onDrawerClose}
            sx={{
              color: "#0046f6",
              "&:hover": {
                backgroundColor: "rgba(0, 70, 246, 0.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Box
        sx={{
          px: 1.5,
          pt: 1.5,
          position: "sticky",
          top: isMobile ? 69 : 69,
          zIndex: 1,
          bgcolor: "background.paper",
        }}
      >
        {" "}
        <TextField
          placeholder="Search by name"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon size={18} />
              </InputAdornment>
            ),
            sx: { height: "40px" },
          }}
          sx={{
            width: "100%",
            "& .MuiInputBase-root": {
              borderRadius: "12px",
              fontSize: "14px",
              height: "40px",
              "& fieldset": {
                borderColor: "var(--textFieldBorderColor, #ced4da)",
                borderRadius: "12px",
              },
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "black",
              borderWidth: "1px",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                borderWidth: "1px",
                boxShadow: "none",
                outline: "none",
              },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--textFieldBorderColor, #ced4da)",
              borderRadius: "12px",
            },
          }}
        />{" "}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            textAlign: "right",
          }}
        >
          <Button
            size="small"
            onClick={handleReset}
            sx={{
              minWidth: "auto",
              mt: 0.3,
              p: 0.1,
              px: 1.5,
              fontSize: "0.85rem",
              textTransform: "none",
              border: "1.5px solid var(--purpleShadeBg)",
              borderRadius: "12px",
              color: "var(--purpleShadeBg)",

              fontWeight: 600,
              letterSpacing: 0.2,
              boxShadow: "none",
              transition: "all 0.2s",
              "&:hover": {
                background: "var(--purpleShadeBg)",
                color: "#fff",
                borderColor: "var(--purpleShadeBg)",
                boxShadow: "0 2px 8px 0 rgba(114,103,240,0.08)",
                textDecoration: "none",
              },
            }}
          >
            Reset
          </Button>
        </Typography>
      </Box>

      {employeesLoading ? (
        <LoadingSkeleton />
      ) : filteredEmployees.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column", // Change to column for vertical layout
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            height: "calc(100vh - 300px)",
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
            <PersonOffOutlined sx={{ fontSize: 24, color: "#757575" }} />
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            No employees found
          </Typography>
        </Box>
      ) : (
        <List
          sx={{
            p: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.2,
            width: 240,
            mx: "auto",
          }}
        >
          {filteredEmployees?.map((employee) => {
            const isActive = selectedEmployee === employee._id;
            const isDisabled = employee.isDisabled === true;

            return (
              <ListItem
                key={employee._id}
                disablePadding
                onClick={() => handleEmployeeSelect(employee._id)}
                sx={{
                  width: "100%",
                  borderRadius: "12px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                   cursor: "pointer",
                  backgroundColor: isActive
                    ? "var(--backgroundColor)"
                    : "transparent",
                  color: isDisabled ? "#999" : "var(--textColor)",
                  fontWeight: isActive ? 600 : 500,
                  border: isDisabled ? "1px dashed #ddd" : "none",
                  // cursor: isDisabled ? "not-allowed" : "pointer",
                  alignItems: "center",
                  py: 0,
                  px: 2,
                  gap: 1.5,
                  height: "60px",
                  minHeight: "60px",
                  mx: "auto",
                  display: "flex",
                  boxShadow: isActive ? "0 2px 8px 0 rgba(0,0,0,0.04)" : "none",
                  opacity: isDisabled ? 0.6 : 1,
                  filter: isDisabled ? "grayscale(30%)" : "none",
                 // pointerEvents: isDisabled ? "none" : "auto", // Disable pointer events for disabled employees
                  pointerEvents: "auto", 
                  "&::before":
                    isActive && !isDisabled
                      ? {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: "60%",
                          width: "4px",
                          backgroundColor: "var(--textColor)",
                          borderRadius: "0 4px 4px 0",
                           cursor: "pointer",
                        }
                      : undefined,
                  "&::after": undefined, // Remove the disabled label from here
                  "&:hover": !isDisabled
                    ? {
                        backgroundColor: "var(--hoverBackgroundColor)",
                        color: "var(--textColor)",
                        fontWeight: 600,
                        boxShadow: "0 4px 16px 0 rgba(0,0,0,0.06)",
                      }
                    : {},
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={employee.profilePhoto || undefined}
                    alt={employee.name}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: isDisabled
                        ? "#f5f5f5"
                        : isActive
                        ? "var(--backgroundColor)"
                        : "#e0e0e0",
                      color: isDisabled ? "#999" : "var(--textColor)",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      border: isDisabled ? "1px solid #ddd" : "none",
                      transition: "all 0.2s",
                      position: "relative",
                      "&::after": isDisabled
                        ? {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(45deg, transparent 30%, rgba(255, 68, 68, 0.2) 30%, rgba(255, 68, 68, 0.2) 70%, transparent 70%)",
                            borderRadius: "50%",
                          }
                        : undefined,
                    }}
                  >
                    {!employee.profilePhoto && employee.name
                      ? employee.name[0].toUpperCase()
                      : ""}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 0.2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isActive ? 600 : 500,
                          color: isDisabled ? "#999" : "var(--textColor)",
                          fontSize: "0.97rem",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 110,
                          px: 0,
                          py: 0,
                          display: "inline-block",
                          textDecoration: isDisabled ? "line-through" : "none",
                        }}
                      >
                        {employee.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isDisabled ? "#bbb" : "#888",
                          fontWeight: 400,
                          fontSize: "0.89rem",
                          letterSpacing: 0.2,
                          textTransform: "capitalize",
                          px: 0,
                          py: 0,
                          borderRadius: 1,
                          display: "inline-block",
                        }}
                      >
                        <>
                          <Box
                            component="span"
                            sx={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              mr: 1,
                              mb: "2px",
                              backgroundColor: isDisabled
                                ? "#ddd"
                                : (() => {
                                    const status = (employee.status || "")
                                      .toLowerCase()
                                      .trim();
                                    if (status === "punch-in")
                                      return "var(--successTextColor)"; // present
                                    if (
                                      status === "leave" ||
                                      status === "absent"
                                    )
                                      return "var(--redShadeColor)"; // absent
                                    if (status === "punch-out")
                                      return "#ff9800"; // orange for punch-out
                                    return "#bbb"; // grey fallback
                                  })(),
                              boxShadow: "0 0 0 1.5px #fff",
                              verticalAlign: "middle",
                            }}
                          />
                          <Box
                            component="span"
                            sx={{
                              ...(isDisabled && {
                                backgroundColor: "rgba(255, 68, 68, 0.1)",
                                color: "#ff4444",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                letterSpacing: "0.5px",
                              }),
                            }}
                          >
                            {isDisabled ? "Disabled" : employee.status}
                          </Box>
                        </>
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </>
  );

  // Desktop/Tablet view - fixed position
  if (!isMobile) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: 270, // Set employee field width to 80%
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh", // Set height to full
          overflowY: "auto",
          overflowX: "hidden", // Prevent horizontal scroll
          borderRadius: "0", // Combine white boxes into one
          bgcolor: "background.paper",
          zIndex: 1000,
          transition: "all 0.3s ease",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: alpha("#000", 0.05),
          },
          "&::-webkit-scrollbar-thumb": {
            background: alpha("#000", 0.1),
            borderRadius: "4px",
            "&:hover": {
              background: alpha("#000", 0.15),
            },
          },
        }}
      >
        {employeeListContent}
      </Paper>
    );
  }

  // Mobile view - drawer
  return (
    <Drawer
      anchor="right"
      open={isDrawerOpen}
      onClose={onDrawerClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: 320, // Set consistent width for the drawer
          maxWidth: "85vw",
          bgcolor: "background.paper",
        },
      }}
    >
      {employeeListContent}
    </Drawer>
  );
};

const Layout = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
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

      {/* Employee Drawer for all screen sizes */}
      {shouldShowEmployeeList && (
        <Drawer
          anchor="right"
          open={employeeDrawerOpen}
          onClose={handleEmployeeDrawerClose} // This handles clickaway
          sx={{
            "& .MuiDrawer-paper": {
              width: 270, // Set consistent width for the drawer
              maxWidth: "85vw",
              bgcolor: "background.paper",
            },
          }}
          // Add these props to ensure clickaway works
          ModalProps={{
            keepMounted: true,
            disablePortal: false,
            BackdropProps: {
              invisible: false,
            },
          }}
        >
          <EmployeeList
            isMobile={isMobile}
            isDrawerOpen={employeeDrawerOpen}
            onDrawerClose={handleEmployeeDrawerClose}
            setSidebarOpenParent={setSidebarOpenParent}
          />
        </Drawer>
      )}

      {/* Employee Button for toggling the drawer */}
      {shouldShowEmployeeList && (
        <Box
          onClick={handleEmployeeDrawerToggle}
          sx={{
            display: employeeDrawerOpen ? 'none' : 'flex', // Hide when drawer is open
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            bottom: 100,
            right: 2,
            zIndex: employeeDrawerOpen ? -1 : 1300, // Lower z-index when drawer is open
            width: 56,
            height: 56,
            backgroundColor: "white",
            borderRadius: "50%",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
            cursor: "pointer", // Add cursor pointer for better UX
            transition: 'opacity 0.3s ease', // Smooth transition
            opacity: employeeDrawerOpen ? 0 : 1, // Fade out when drawer is open
          }}
        >
          <IconButton
            sx={{
              color: "#0046f6",
              padding: 0,
              "&:hover": {
                backgroundColor: "rgba(0, 70, 246, 0.1)",
              },
            }}
          >
            <GroupIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default Layout;
