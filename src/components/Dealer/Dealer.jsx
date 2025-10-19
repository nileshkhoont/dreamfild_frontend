import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled,
  TablePagination,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Menu,
  MenuItem,
  IconButton,
  Switch,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import { Plus, Edit2, Trash2, User, Users } from "lucide-react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import {
  useGetDealersQuery,
  useRegisterDealerMutation,
  useUpdateDealerStatusMutation,
  useAddDealerUserMutation,
} from "../../apiService";

const Container = styled(Box)({
  margin: "0 auto",
  paddingTop: "2rem",
  overflow: "hidden",
});

const StyledTableContainer = styled(TableContainer)({
  borderRadius: 16,
  border: "none",
  "& .MuiTableCell-head": {
    backgroundColor: "var(--tableHeaderBackgroundColor)",
    fontWeight: 600,
    color: "var(--textColor)",
    borderBottom: "none",
    position: "sticky",
    top: 0,
    zIndex: 0,
  },
  "& .MuiTableCell-root": { borderBottom: "none", borderRight: "none" },
  "& .MuiTableRow-root:hover": {
    backgroundColor: "var(--hoverBackgroundColor)",
    transition: "background-color 0.3s ease",
  },
});

const Dealer = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    number: "",
    role: "",
  });
  const [addUserFormData, setAddUserFormData] = useState({
    displayName: "",
    email: "",
    number: "",
    password: "",
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDealerId, setSelectedDealerId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { data, isLoading, refetch } = useGetDealersQuery({ page: page + 1, limit: rowsPerPage });
  const [registerDealer, { isLoading: isSubmitting }] = useRegisterDealerMutation();
  const [updateDealerStatus] = useUpdateDealerStatusMutation();
  const [addDealerUser, { isLoading: isUserAdding }] = useAddDealerUserMutation();

  const dealers = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ displayName: "", email: "", number: "", role: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUserInputChange = (e) => {
    const { name, value } = e.target;
    setAddUserFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await registerDealer(formData).unwrap();
      setSnackbar({
        open: true,
        message: "Dealer added successfully!",
        severity: "success",
      });
      handleCloseDialog();
      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to add dealer",
        severity: "error",
      });
    }
  };

  const handleOpenMenu = (event, dealerId) => {
    setAnchorEl(event.currentTarget);
    setSelectedDealerId(dealerId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedDealerId(null);
  };

  const handleStatusToggle = async (dealer) => {
    const newStatus = dealer.status === "active" ? "deactive" : "active";
    try {
      await updateDealerStatus({ id: dealer.id, status: newStatus }).unwrap();
      setSnackbar({
        open: true,
        message: `Status updated to ${newStatus}`,
        severity: "success",
      });
      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to update status",
        severity: "error",
      });
    }
  };

  const handleOpenAddUserDialog = () => {
    setOpenAddUserDialog(true);
    handleCloseMenu();
  };

  const handleCloseAddUserDialog = () => {
    setOpenAddUserDialog(false);
    setAddUserFormData({ displayName: "", email: "", number: "", password: "" });
  };

  const handleAddUserSubmit = async () => {
    try {
      await addDealerUser(addUserFormData).unwrap();
      setSnackbar({
        open: true,
        message: "User added successfully!",
        severity: "success",
      });
      handleCloseAddUserDialog();
      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to add user",
        severity: "error",
      });
    }
  };

  const getStatusColor = (status) => {
    return status?.toLowerCase() === "active" ? "success" : "default";
  };

  return (
    <Container>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          color: "var(--textColor)",
          minHeight: "300px",
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Users size={22} color="var(--textColor)" />
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
                    Dealer List
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<Plus size={18} />}
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
                    minWidth: "120px",
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow: "none",
                    },
                  }}
                  onClick={handleOpenDialog}
                >
                  Add Dealer
                </Button>
              </Box>
            </Box>
          }
        />
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : dealers.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
                gap: 2,
              }}
            >
              <Users size={48} color="#ccc" />
              <Typography variant="body1" sx={{ color: "#666" }}>
                No dealers found
              </Typography>
            </Box>
          ) : (
            <>
              <StyledTableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Number</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>GST Number</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dealers.map((dealer) => (
                      <TableRow key={dealer.id}>
                        <TableCell>{dealer.id}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{dealer.displayName}</TableCell>
                        <TableCell>{dealer.email}</TableCell>
                        <TableCell>{dealer.number}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip
                              label={dealer.status}
                              color={getStatusColor(dealer.status)}
                              size="small"
                              sx={{
                                textTransform: "capitalize",
                                fontWeight: 500,
                                borderRadius: "8px",
                              }}
                            />
                            <Tooltip
                              title={`Toggle to ${
                                dealer.status === "active" ? "deactive" : "active"
                              }`}
                            >
                              <Switch
                                checked={dealer.status === "active"}
                                onChange={() => handleStatusToggle(dealer)}
                                size="small"
                                sx={{
                                  "& .MuiSwitch-switchBase.Mui-checked": {
                                    color: "var(--purpleShadeBg)",
                                  },
                                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                    {
                                      backgroundColor: "var(--purpleShadeBg)",
                                    },
                                }}
                              />
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>{dealer.gstNumber || "-"}</TableCell>
                        <TableCell>
                          {dealer.createdAt
                            ? new Date(dealer.createdAt).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                            <Tooltip title="Add User">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenAddUserDialog()}
                                sx={{
                                  color: "var(--purpleShadeBg)",
                                  "&:hover": {
                                    backgroundColor: "rgba(80, 60, 180, 0.1)",
                                  },
                                }}
                              >
                                <User size={18} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Dealer Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: 380,
            minWidth: 380,
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(80, 60, 180, 0.15)",
            background: "#fff",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 22,
            color: "var(--purpleShadeBg)",
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <Users size={22} />
          Add Dealer
          <IconButton
            onClick={handleCloseDialog}
            size="small"
            sx={{ ml: "auto", color: "inherit" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            mt: 3,
            px: 3,
            py: 2,
            background: "rgba(255,255,255,0.95)",
            borderRadius: 3,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  mb: 0.5,
                  textAlign: "left",
                }}
              >
                Name
              </Typography>
              <TextField
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Enter dealer name"
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "14px",
                    borderRadius: "12px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--textFieldBorderColor, #ced4da)",
                    borderRadius: "12px",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={18} color="#888" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  mb: 0.5,
                  textAlign: "left",
                }}
              >
                Email
              </Typography>
              <TextField
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Enter email"
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "14px",
                    borderRadius: "12px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--textFieldBorderColor, #ced4da)",
                    borderRadius: "12px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  mb: 0.5,
                  textAlign: "left",
                }}
              >
                Number
              </Typography>
              <TextField
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Enter phone number"
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "14px",
                    borderRadius: "12px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--textFieldBorderColor, #ced4da)",
                    borderRadius: "12px",
                  },
                }}
              />
            </Grid>
            
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              fontWeight: 600,
              fontSize: 15,
              borderRadius: "12px",
              textTransform: "none",
              color: "var(--textColor)",
              border: "1px solid var(--textFieldBorderColor, #ced4da)",
              padding: "8px 20px",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{
              backgroundColor: "var(--purpleShadeBg)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "8px 24px",
              fontWeight: 600,
              fontSize: 15,
              textTransform: "none",
              whiteSpace: "nowrap",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "var(--purpleShadeBg)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Add Dealer"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog
        open={openAddUserDialog}
        onClose={handleCloseAddUserDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: 380,
            minWidth: 380,
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(80, 60, 180, 0.15)",
            background: "#fff",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 22,
            color: "var(--purpleShadeBg)",
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <User size={22} />
          Add User
          <IconButton
            onClick={handleCloseAddUserDialog}
            size="small"
            sx={{ ml: "auto", color: "inherit" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            mt: 3,
            px: 3,
            py: 2,
            background: "rgba(255,255,255,0.95)",
            borderRadius: 3,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  mb: 0.5,
                  textAlign: "left",
                }}
              >
                Name
              </Typography>
              <TextField
                name="displayName"
                value={addUserFormData.displayName}
                onChange={handleAddUserInputChange}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Enter user name"
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "14px",
                    borderRadius: "12px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--textFieldBorderColor, #ced4da)",
                    borderRadius: "12px",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={18} color="#888" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  mb: 0.5,
                  textAlign: "left",
                }}
              >
                Email
              </Typography>
              <TextField
                name="email"
                value={addUserFormData.email}
                onChange={handleAddUserInputChange}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Enter email"
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "14px",
                    borderRadius: "12px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--textFieldBorderColor, #ced4da)",
                    borderRadius: "12px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  mb: 0.5,
                  textAlign: "left",
                }}
              >
                Number
              </Typography>
              <TextField
                name="number"
                value={addUserFormData.number}
                onChange={handleAddUserInputChange}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Enter phone number"
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "14px",
                    borderRadius: "12px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--textFieldBorderColor, #ced4da)",
                    borderRadius: "12px",
                  },
                }}
              />
            </Grid>
            
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseAddUserDialog}
            sx={{
              fontWeight: 600,
              fontSize: 15,
              borderRadius: "12px",
              textTransform: "none",
              color: "var(--textColor)",
              border: "1px solid var(--textFieldBorderColor, #ced4da)",
              padding: "8px 20px",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddUserSubmit}
            disabled={isUserAdding}
            sx={{
              backgroundColor: "var(--purpleShadeBg)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "8px 24px",
              fontWeight: 600,
              fontSize: 15,
              textTransform: "none",
              whiteSpace: "nowrap",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "var(--purpleShadeBg)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              },
            }}
          >
            {isUserAdding ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Add User"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dealer;
