import React from "react";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useDisableUserMutation,
  useToggleWorkFromHomeMutation,
} from "../../apiService";
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
  IconButton,
  Button,
  Avatar,
  TextField,
  InputAdornment,
  Chip, // Add this import
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import TableSortLabel from "@mui/material/TableSortLabel";
import {
  LoaderCircle,
  User,
  UserCircle,
  UserCog,
  UserIcon,
  UserPlus,
  Search,
} from "lucide-react";
import { AiFillEdit } from "react-icons/ai";
import { MdDeleteOutline } from "react-icons/md";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Switch from "@mui/material/Switch";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { CustomLoader } from "../Layout/CustomLoader";
import Register from "../RegisterForm/Register";
import Autocomplete from "@mui/material/Autocomplete";
import DeleteDialogBox from "../DeleteDialogBox"; // Add this import at the top

import "../../App.css";

// Updated Container styling to match Leave.jsx and TaskList.jsx
const Container = styled(Box)({
  // maxWidth: 1400,
  margin: "0 auto",
  // backgroundColor: "red",
  paddingTop: "2rem",
});

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  border: "none",
  "& .MuiTableCell-head": {
    backgroundColor: "var(--tableHeaderBackgroundColor)",
    fontWeight: 600,
    color: "var(--textColor)",
    borderBottom: "none",
  },
  "& .MuiTableCell-root": {
    borderBottom: "none",
    borderRight: "none",
  },
  "& .MuiTableRow-root:hover": {
    backgroundColor: "var(--hoverBackgroundColor)",
    transition: "background-color 0.3s ease",
  },
}));

// Inject custom scrollbar CSS for modals
const modalScrollbarStyles = `
  .modal-scrollable-content {
    height: 100%;
    overflow-y: auto;
    padding-right: 18px; /* Inset scrollbar from right edge */
    box-sizing: content-box;
    border-radius: 0 24px 24px 0; /* Curve right side */
    background-clip: padding-box;
    /* Optional: subtle background for demo */
  }
  .modal-scrollable-content::-webkit-scrollbar {
    width: 12px;
    background: transparent;
  }
  .modal-scrollable-content::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #e0e0e0 60%, #bdbdbd 100%);
    border-radius: 24px;
    margin: 2px;
    border: 3px solid transparent;
    background-clip: padding-box;
    box-shadow: 0 0 0 6px #fff inset;
  }
  .modal-scrollable-content::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 24px;
  }
  /* Firefox */
  .modal-scrollable-content {
    scrollbar-width: thin;
    scrollbar-color: #bdbdbd #fff;
  }
`;

const AllUsers = () => {
  const {
    data: employeesResponse,
    refetch,
    isLoading: employeesLoading,
    error,
  } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [disableUser] = useDisableUserMutation();
  const [toggleWorkFromHome] = useToggleWorkFromHomeMutation();
  const [open, setOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [miuiModalOpen, setMiuiModalOpen] = React.useState(false);
  const [viewModalOpen, setViewModalOpen] = React.useState(false);
  const [selectedViewUser, setSelectedViewUser] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedMenuUser, setSelectedMenuUser] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  const [selectedWfhUser, setSelectedWfhUser] = React.useState([]); // Changed from null to []

  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("name");

  const navigate = useNavigate();

const loggedInUser = React.useMemo(() => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}, []);

const userRole = loggedInUser?.role || "user";
console.log("Logged in user role:", userRole);
  


const handleOpen = (userId) => {
    console.log("Opening delete dialog for userId:", userId);
    setSelectedUserId(userId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUserId(null);
  };

  const handleEditModalOpen = (user) => {
    // Instead of opening modal, navigate to edit page
    navigate(`/edit-profile/${user._id}`);
  };

  const handleViewModalOpen = (user) => {
    // Instead of opening modal, navigate to view profile page
    navigate(`/view-profile/${user._id}`);
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedMenuUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMenuUser(null);
  };

  const handleMenuView = () => {
    handleViewModalOpen(selectedMenuUser);
    handleMenuClose();
  };

  const handleMenuEdit = () => {
    handleEditModalOpen(selectedMenuUser);
    handleMenuClose();
  };

  const handleMenuDelete = () => {
    handleOpen(selectedMenuUser._id);
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    console.log("Confirming delete for userId:", selectedUserId);
    if (selectedUserId) {
      try {
        console.log("Sending delete request with payload:", {
          userId: selectedUserId,
        });
        const result = await deleteUser({ userId: selectedUserId }).unwrap();
        console.log("Delete result:", result);

        setSnackbar({
          open: true,
          message: result.message || "User deleted successfully.",
          severity: "success",
        });

        refetch();
      } catch (err) {
        console.error("Delete failed", err);

        setSnackbar({
          open: true,
          message: err?.data?.message || "Failed to delete user.",
          severity: "error",
        });
      }
    } else {
      console.error("No selectedUserId found when trying to delete");
    }
    handleClose();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSwitchChange = async (userId, currentStatus) => {
    try {
      const newStatus =
        currentStatus === "punch-in" ? "not punch-in" : "punch-in";
      console.log("Toggling user status:", {
        userId,
        currentStatus,
        newStatus,
      });

      const result = await disableUser({
        userId: userId,
        status: newStatus,
      }).unwrap();

      console.log("Disable/Enable result:", result);

      setSnackbar({
        open: true,
        message: result.message || "User status updated successfully.",
        severity: "success",
      });

      refetch();
    } catch (err) {
      console.error("Status update failed", err);

      setSnackbar({
        open: true,
        message: err?.data?.message || "Failed to update user status.",
        severity: "error",
      });
    }
  };

  const handleMiuiModalOpen = () => setMiuiModalOpen(true);
  const handleMiuiModalClose = () => {
    setMiuiModalOpen(false);
    refetch();
  };

  React.useEffect(() => {
    // Inject the custom scrollbar styles once
    const style = document.createElement("style");
    style.innerHTML = modalScrollbarStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Define users before using it in filteredUsers
  const users =
    employeesResponse &&
      employeesResponse.responseData &&
      employeesResponse.responseData.data
      ? employeesResponse.responseData.data
      : [];

  // Filter users based on search term
  const filteredUsers = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone &&
          user.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  // Sorting logic
  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  if (employeesLoading)
    return (
      <Container>
        <Box
          sx={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <CustomLoader />
        </Box>
      </Container>
    );
  if (error)
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          color: "var(--textColor)",
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: 1,
        }}
      >
        <Box
          sx={{
            background: "rgba(255,0,0,0.08)",
            border: "1px solid var(--redShadeColor, #f44336)",
            borderRadius: 2,
            px: 4,
            py: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
            boxShadow: "0 2px 12px rgba(244,67,54,0.08)",
          }}
        >
          <DeleteIcon
            sx={{ color: "var(--redShadeColor, #f44336)", mr: 2, fontSize: 36 }}
          />
          Error loading users.
        </Box>
      </Box>
    );

  return (
    <Container>
      <Card
        sx={{
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          color: "var(--textColor)",
          pt: 0.9,
          minHeight: "calc(100vh - 140px)", // Add minimum height to fill viewport
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardHeader
          title={
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
              }}
            >
              {/* Header with Icon and Title */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <UserIcon size={22} color="var(--textColor)" />
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
                    User List
                  </Typography>
                </Box>
              </Box>

              {/* Search Bar and Add User Button Below Header */}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  flexWrap: "nowrap",
                  width: "100%",
                }}
              >
                {/* Only Search Input - Remove Toggle Work From Home */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {/* Search Input - Left Side */}
                  <Box sx={{ minWidth: 200, maxWidth: 350, width: 250 }}>
                    <TextField
                      placeholder="Search by name."
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
                        height: "40px",
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
                </Box>
                {/* Add User Button - Far Right, only for admin */}
                {userRole === "admin" && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{
                        backgroundColor: "white", color: "var(--purpleShadeBg)",
             
              borderRadius: "5px",
                      fontWeight: 600,
                      fontSize: "14px",
                      textTransform: "none",
                      px: 2,
                      py: 1,
                      height: "40px",
                      minWidth: "120px",
                      boxShadow: "none",
                      "&:hover": {
                          boxShadow: "none",
                      },
                    }}
                    onClick={() => navigate("/register")}
                  >
                    + Add User
                  </Button>
                )}
              </Box>
            </Box>
          }
        />
        <CardContent sx={{ flexGrow: 1, pb: 3, display: "flex", flexDirection: "column" }}>
          {/* Fixed Table Header */}
          <StyledTableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "16px 16px 0 0", // Only top corners rounded
              marginBottom: 0,
            }}
          >
            <Table sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    width: "25%", 
                    py: 1.5, 
                    fontWeight: 600,
                    backgroundColor: "var(--tableHeaderBackgroundColor)",
                    borderBottom: "1px solid #e0e0e0"
                  }}>
                    <TableSortLabel
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={(e) => handleRequestSort(e, "name")}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ 
                    width: "25%", 
                    py: 1.5, 
                    fontWeight: 600,
                    backgroundColor: "var(--tableHeaderBackgroundColor)",
                    borderBottom: "1px solid #e0e0e0"
                  }}>
                    <TableSortLabel
                      active={orderBy === "email"}
                      direction={orderBy === "email" ? order : "asc"}
                      onClick={(e) => handleRequestSort(e, "email")}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ 
                    width: "25%", 
                    py: 1.5, 
                    fontWeight: 600,
                    backgroundColor: "var(--tableHeaderBackgroundColor)",
                    borderBottom: "1px solid #e0e0e0"
                  }}>
                    <TableSortLabel
                      active={orderBy === "phone"}
                      direction={orderBy === "phone" ? order : "asc"}
                      onClick={(e) => handleRequestSort(e, "phone")}
                    >
                      Phone
                    </TableSortLabel>
                  </TableCell>
                  {userRole === "user" && (
                    <TableCell sx={{ 
                      width: "25%", 
                      py: 1.5, 
                      fontWeight: 600,
                      backgroundColor: "var(--tableHeaderBackgroundColor)",
                      borderBottom: "1px solid #e0e0e0"
                    }}>
                      Blood Group
                    </TableCell>
                  )}
                  {userRole === "admin" && (
                    <TableCell sx={{ 
                      width: "25%", 
                      py: 1.5, 
                      fontWeight: 600,
                      backgroundColor: "var(--tableHeaderBackgroundColor)",
                      borderBottom: "1px solid #e0e0e0"
                    }}>
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
            </Table>
          </StyledTableContainer>

          {/* Scrollable Table Body */}
          <StyledTableContainer
            component={Paper}
            elevation={0}
            sx={{ 
              height: "calc(100vh - 380px)", // Adjust height to account for header
              maxHeight: "calc(100vh - 380px)",
              overflowY: "auto", // Enable vertical scrolling
              overflowX: "hidden", // Hide horizontal scroll
              flexGrow: 1,
              borderRadius: "0 0 16px 16px", // Only bottom corners rounded
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
                "&:hover": {
                  background: "rgba(0,0,0,0.5)",
                },
              },
            }}
          >
            <Table sx={{ tableLayout: "fixed" }}>
              <TableBody>
                {filteredUsers
                  .filter(user => userRole === "admin" || !user.isDisabled) // Only admin sees disabled users
                  .slice()
                  .sort(getComparator(order, orderBy))
                  .map((user) => (
                    <TableRow
                      key={user._id}
                      sx={{
                        opacity: user.isDisabled ? 0.5 : 1, // Reduce opacity if user is disabled
                        transition: "opacity 0.2s",
                      }}
                    >
                      <TableCell sx={{ py: 2, width: "25%" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            src={user.profilePhoto || undefined}
                            alt={user.name}
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: "var(--purpleShadeBg)",
                              color: "white",
                              fontWeight: 600,
                              fontSize: 15,
                            }}
                          >
                            {!user.profilePhoto && user.name
                              ? user.name[0].toUpperCase()
                              : ""}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 500 }}>
                              {user.name}
                              {user.isWorkFromHome && (
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
                            </Typography>
                            {userRole === "user" && (
                              <Typography sx={{ fontSize: "0.8rem", color: "gray", mt: 0.5 }}>
                                {user.designation}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, width: "25%" }}>{user.email}</TableCell>
                      <TableCell sx={{ py: 2, width: "25%" }}>{user.phone ? user.phone : "-"}</TableCell>
                      {userRole === "user" && (
                        <TableCell sx={{ py: 2, width: "25%" }}>{user.bloodGroup || "-"}</TableCell>
                      )}
                      {userRole === "admin" && (
                        <TableCell sx={{ py: 2, width: "25%" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <IconButton
                              aria-label="more actions"
                              size="small"
                              sx={{ color: "var(--textColor)" }}
                              onClick={(e) => handleMenuOpen(e, user)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            minWidth: 140,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleMenuView}>
          <ListItemIcon>
            <VisibilityIcon
              fontSize="small"
              sx={{ color: "var(--purpleShadeBg)" }}
            />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: "#1976d2" }} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            // Toggle disabled status for the selected user
            if (selectedMenuUser) {
              await handleSwitchChange(
                selectedMenuUser._id,
                selectedMenuUser.isDisabled ? "not punch-in" : "punch-in"
              );
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Switch
              checked={!!selectedMenuUser?.isDisabled}
              color="primary"
              size="small"
              edge="start"
              inputProps={{ "aria-label": "Disable user" }}
             
            />
          </ListItemIcon>
          <ListItemText>
            {selectedMenuUser?.isDisabled ? "Enable User" : "Disable User"}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuDelete}>
          <ListItemIcon>
            <DeleteIcon
              fontSize="small"
              sx={{ color: "var(--redShadeColor)" }}
            />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <DeleteDialogBox
        deleteDialogOpen={open}
        handleCancelDelete={handleClose}
        handleConfirmDelete={handleConfirmDelete}
        isDeleting={false}
                name={users.find(u => u._id === selectedUserId)?.name || ""}
      />

      {/* Add User Modal */}
      {miuiModalOpen && (
        <Register open={miuiModalOpen} onSuccess={handleMiuiModalClose} />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000} // Changed from 4000 to 3000
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Custom scrollbar and masking for modal scrollable content */}
      <style>
        {`
          .modal-scrollable-content {
            scrollbar-width: thin;
            scrollbar-color: #bdbdbd #f5f5f5;
            border-radius: 0 24px 24px 0;
            position: relative;
            background: transparent;
          }
          .modal-scrollable-content::-webkit-scrollbar {
            width: 10px;
            background: #f5f5f5;
            border-radius: 0 24px 24px 0;
          }
          .modal-scrollable-content::-webkit-scrollbar-thumb {
            background: #bdbdbd;
            border-radius: 0 24px 24px 0;
            min-height: 40px;
            border: 2px solid #f5f5f5;
          }
          .modal-scrollable-content::-webkit-scrollbar-track {
            background: #f5f5f5;
            border-radius: 0 24px 24px 0;
          }
          /* Mask the right edge for the curve effect */
          .modal-scrollable-content::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 18px;
            height: 100%;
            pointer-events: none;
            background: linear-gradient(to left, white 60%, transparent 100%);
            border-radius: 0 24px 24px 0;
            z-index: 2;
            display: block;
          }
        `}
      </style>
    </Container>
  );
};



export default AllUsers;