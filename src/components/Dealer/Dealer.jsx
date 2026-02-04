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
  Divider,
  Autocomplete,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from "@mui/material";
import { Plus, Edit2, Trash2, User, Users, Eye, Link } from "lucide-react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import {
  useGetDealersQuery,
  useRegisterDealerMutation,
  useUpdateDealerStatusMutation,
  useAddDealerUserMutation,
  useGetTallyLedgersQuery,
  useCreatePartyLedgerMappingMutation,
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

const ImageContainer = styled(Box)({
  width: "100%",
  height: "200px",
  border: "2px dashed #ddd",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f9f9f9",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "var(--purpleShadeBg)",
    backgroundColor: "#f5f5f5",
  },
});

const ImagePreview = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "8px",
});

const Dealer = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [openViewDetailsDialog, setOpenViewDetailsDialog] = useState(false);
  const [openLedgerMappingDialog, setOpenLedgerMappingDialog] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [ledgerValidationError, setLedgerValidationError] = useState(false); // Add this state
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
    parentId: null,
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
  
  // New queries for ledger functionality
  const { data: ledgerData, isLoading: isLoadingLedgers } = useGetTallyLedgersQuery(
    { event: "fetch_ledgers" },
    { skip: !openLedgerMappingDialog }
  );
  const [createPartyLedgerMapping, { isLoading: isCreatingMapping }] = useCreatePartyLedgerMappingMutation();

  const dealers = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const ledgers = ledgerData?.data || [];

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
    // Allow only numbers for phone number field and limit to 10 digits
    if (name === 'number') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddUserInputChange = (e) => {
    const { name, value } = e.target;
    // Allow only numbers for phone number field and limit to 10 digits
    if (name === 'number') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setAddUserFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setAddUserFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    // Validate phone number is exactly 10 digits
    if (!formData.number || formData.number.length !== 10) {
      setSnackbar({
        open: true,
        message: "Phone number must be exactly 10 digits",
        severity: "error",
      });
      return;
    }

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

  const handleOpenAddUserDialog = (dealer) => {
    setSelectedDealer(dealer);
    setAddUserFormData(prev => ({ ...prev, parentId: dealer.id }));
    setOpenAddUserDialog(true);
    handleCloseMenu();
  };

  const handleCloseAddUserDialog = () => {
    setOpenAddUserDialog(false);
    setAddUserFormData({ displayName: "", email: "", number: "", password: "", parentId: null });
    setSelectedDealer(null);
  };

  const handleAddUserSubmit = async () => {
    // Validate phone number is exactly 10 digits
    if (!addUserFormData.number || addUserFormData.number.length !== 10) {
      setSnackbar({
        open: true,
        message: "Phone number must be exactly 10 digits",
        severity: "error",
      });
      return;
    }

    // Validate parentId exists
    if (!addUserFormData.parentId) {
      setSnackbar({
        open: true,
        message: "Dealer information is missing. Please try again.",
        severity: "error",
      });
      return;
    }

    console.log('Submitting user data:', addUserFormData);

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

    const getImageUrl = (fileUrl) => {
    if (!fileUrl) return null;
    // Check if the URL already starts with http
    if (fileUrl.startsWith('http')) {
      return fileUrl;
    }
    // Use the correct environment variable name
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4100';
    return `${baseUrl}${fileUrl}`;
  };

  const handleOpenViewDetailsDialog = (dealer) => {
    // console.log('Selected dealer:', dealer);
    // console.log('Shop Image:', dealer.shopImage);
    // console.log('Shop Image URL:', getImageUrl(dealer.shopImage));
    // console.log('Pesticide License:', dealer.pesticideLicenseImage);
    // console.log('Pesticide License URL:', getImageUrl(dealer.pesticideLicenseImage));
    // console.log('Fertilizer License:', dealer.fertilizerLicenseImage);
    // console.log('Fertilizer License URL:', getImageUrl(dealer.fertilizerLicenseImage));
    setSelectedDealer(dealer);
    setOpenViewDetailsDialog(true);
  };

  const handleCloseViewDetailsDialog = () => {
    setOpenViewDetailsDialog(false);
    setSelectedDealer(null);
  };

  // New functions for ledger mapping
  const handleOpenLedgerMappingDialog = (dealer) => {
    setSelectedDealer(dealer);
    setSelectedLedger(null);
    setLedgerValidationError(false); // Reset validation error
    setOpenLedgerMappingDialog(true);
  };

  const handleCloseLedgerMappingDialog = () => {
    setOpenLedgerMappingDialog(false);
    setSelectedDealer(null);
    setSelectedLedger(null);
    setLedgerValidationError(false); // Reset validation error
  };

  const handleLedgerMappingSubmit = async () => {
    if (!selectedDealer || !selectedLedger) {
      setLedgerValidationError(true); // Set validation error
      setSnackbar({
        open: true,
        message: "Please select a ledger",
        severity: "error",
      });
      return;
    }

    try {
      await createPartyLedgerMapping({
        userId: selectedDealer.id,
        partyLedgerName: selectedLedger.ledgerName,
        partyLedgerGUID: selectedLedger.ledgerGUID,
      }).unwrap();
      
      setSnackbar({
        open: true,
        message: "Party ledger mapping created successfully!",
        severity: "success",
      });
      handleCloseLedgerMappingDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to create mapping",
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
                                ...(dealer.status?.toLowerCase() === "active" && {
                                  backgroundColor: "#2563eb",
                                  color: "white",
                                }),
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
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenViewDetailsDialog(dealer)}
                                sx={{
                                  color: "var(--purpleShadeBg)",
                                  "&:hover": {
                                    backgroundColor: "rgba(80, 60, 180, 0.1)",
                                  },
                                }}
                              >
                                <Eye size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Add User">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenAddUserDialog(dealer)}
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
                            <Tooltip title="Link Ledger">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenLedgerMappingDialog(dealer)}
                                sx={{
                                  color: "var(--purpleShadeBg)",
                                  "&:hover": {
                                    backgroundColor: "rgba(80, 60, 180, 0.1)",
                                  },
                                }}
                              >
                                <Link size={18} />
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

      {/* View Dealer Details Dialog */}
      <Dialog
        open={openViewDetailsDialog}
        onClose={handleCloseViewDetailsDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: 500,
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
          <Eye size={22} />
          Dealer Details
          <IconButton
            onClick={handleCloseViewDetailsDialog}
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
            mt: 2,
            px: 3,
            py: 2,
          }}
        >
          {selectedDealer && (
            <Grid container spacing={3}>
              {/* Dealer Information */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "var(--purpleShadeBg)",
                    mb: 2,
                  }}
                >
                  Dealer Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    mb: 0.5,
                  }}
                >
                  ID
                </Typography>
                <TextField
                  value={selectedDealer.id || "-"}
                  fullWidth
                  size="small"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
                      backgroundColor: "#f9f9f9",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    mb: 0.5,
                  }}
                >
                  Name
                </Typography>
                <TextField
                  value={selectedDealer.displayName || "-"}
                  fullWidth
                  size="small"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
                      backgroundColor: "#f9f9f9",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    mb: 0.5,
                  }}
                >
                  Email
                </Typography>
                <TextField
                  value={selectedDealer.email || "-"}
                  fullWidth
                  size="small"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
                      backgroundColor: "#f9f9f9",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    mb: 0.5,
                  }}
                >
                  Password
                </Typography>
                <TextField
                  value={selectedDealer.password || "-"}
                  fullWidth
                  size="small"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
                      backgroundColor: "#f9f9f9",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    mb: 0.5,
                  }}
                >
                  Number
                </Typography>
                <TextField
                  value={selectedDealer.number || "-"}
                  fullWidth
                  size="small"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
                      backgroundColor: "#f9f9f9",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    mb: 0.5,
                  }}
                >
                  GST Number
                </Typography>
                <TextField
                  value={selectedDealer.gstNumber || "-"}
                  fullWidth
                  size="small"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
                      backgroundColor: "#f9f9f9",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    mb: 0.5,
                  }}
                >
                  Status
                </Typography>
                <TextField
                  value={selectedDealer.status || "-"}
                  fullWidth
                  size="small"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
                      backgroundColor: "#f9f9f9",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    mb: 0.5,
                  }}
                >
                  Shop Latitude
                </Typography>
                <TextField
                  value={selectedDealer.shopLocationLatitude || "-"}
                  fullWidth
                  size="small"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
                      backgroundColor: "#f9f9f9",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    mb: 0.5,
                  }}
                >
                  Shop Longitude
                </Typography>
                <TextField
                  value={selectedDealer.shopLocationLongitude || "-"}
                  fullWidth
                  size="small"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
                      backgroundColor: "#f9f9f9",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    mb: 0.5,
                  }}
                >
                  Created At
                </Typography>
                <TextField
                  value={
                    selectedDealer.createdAt
                      ? new Date(selectedDealer.createdAt).toLocaleDateString()
                      : "-"
                  }
                  fullWidth
                  size="small"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
                      backgroundColor: "#f9f9f9",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    mb: 0.5,
                  }}
                >
                  Updated At
                </Typography>
                <TextField
                  value={
                    selectedDealer.updatedAt
                      ? new Date(selectedDealer.updatedAt).toLocaleDateString()
                      : "-"
                  }
                  fullWidth
                  size="small"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
                      backgroundColor: "#f9f9f9",
                    },
                  }}
                />
              </Grid>

              {/* Images Section - Only show if at least one image exists */}
              {(selectedDealer.shopImage || selectedDealer.pesticideLicenseImage || selectedDealer.fertilizerLicenseImage) && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "var(--purpleShadeBg)",
                        mb: 2,
                      }}
                    >
                      Images
                    </Typography>
                  </Grid>

                  {/* Shop Image - Only show if exists */}
                  {selectedDealer.shopImage && (
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#374151",
                          mb: 1,
                        }}
                      >
                        Shop Image
                      </Typography>
                      <ImageContainer
                        onClick={() => {
                          const imageUrl = getImageUrl(selectedDealer.shopImage);
                          if (imageUrl) window.open(imageUrl, '_blank');
                        }}
                      >
                        <ImagePreview 
                          src={getImageUrl(selectedDealer.shopImage)}
                          alt="Shop Image"
                          onError={(e) => {
                            console.error('Failed to load shop image:', e.target.src);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log('Shop image loaded successfully');
                          }}
                        />
                        <Box sx={{ display: 'none', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <Typography variant="body2" color="#666">
                            Image not found
                          </Typography>
                        </Box>
                      </ImageContainer>
                    </Grid>
                  )}

                  {/* Pesticide License Image - Only show if exists */}
                  {selectedDealer.pesticideLicenseImage && (
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#374151",
                          mb: 1,
                        }}
                      >
                        Pesticide License Image
                      </Typography>
                      <ImageContainer
                        onClick={() => {
                          const imageUrl = getImageUrl(selectedDealer.pesticideLicenseImage);
                          if (imageUrl) window.open(imageUrl, '_blank');
                        }}
                      >
                        <ImagePreview 
                          src={getImageUrl(selectedDealer.pesticideLicenseImage)}
                          alt="Pesticide License"
                          onError={(e) => {
                            console.error('Failed to load pesticide license image:', e.target.src);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log('Pesticide license image loaded successfully');
                          }}
                        />
                        <Box sx={{ display: 'none', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <Typography variant="body2" color="#666">
                            Image not found
                          </Typography>
                        </Box>
                      </ImageContainer>
                    </Grid>
                  )}

                  {/* Fertilizer License Image - Only show if exists */}
                  {selectedDealer.fertilizerLicenseImage && (
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#374151",
                          mb: 1,
                        }}
                      >
                        Fertilizer License Image
                      </Typography>
                      <ImageContainer
                        onClick={() => {
                          const imageUrl = getImageUrl(selectedDealer.fertilizerLicenseImage);
                          if (imageUrl) window.open(imageUrl, '_blank');
                        }}
                      >
                        <ImagePreview 
                          src={getImageUrl(selectedDealer.fertilizerLicenseImage)}
                          alt="Fertilizer License"
                          onError={(e) => {
                            console.error('Failed to load fertilizer license image:', e.target.src);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log('Fertilizer license image loaded successfully');
                          }}
                        />
                        <Box sx={{ display: 'none', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <Typography variant="body2" color="#666">
                            Image not found
                          </Typography>
                        </Box>
                      </ImageContainer>
                    </Grid>
                  )}
                </>
              )}

              {/* Dealer Users Section */}
              {selectedDealer.dealerUsers && selectedDealer.dealerUsers.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "var(--purpleShadeBg)",
                        mb: 2,
                      }}
                    >
                      Dealer Users ({selectedDealer.dealerUsers.length})
                    </Typography>
                  </Grid>
                  
                  {selectedDealer.dealerUsers.map((user, index) => (
                    <React.Fragment key={user.id}>
                      <Grid item xs={12}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: "#374151",
                            mb: 1,
                          }}
                        >
                          User {index + 1}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#374151",
                            mb: 0.5,
                          }}
                        >
                          Name
                        </Typography>
                        <TextField
                          value={user.displayName || "-"}
                          fullWidth
                          size="small"
                          variant="outlined"
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={{
                            "& .MuiInputBase-root": {
                              fontSize: "14px",
                              borderRadius: "12px",
                              backgroundColor: "#f9f9f9",
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#374151",
                            mb: 0.5,
                          }}
                        >
                          Email
                        </Typography>
                        <TextField
                          value={user.email || "-"}
                          fullWidth
                          size="small"
                          variant="outlined"
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={{
                            "& .MuiInputBase-root": {
                              fontSize: "14px",
                              borderRadius: "12px",
                              backgroundColor: "#f9f9f9",
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#374151",
                            mb: 0.5,
                          }}
                        >
                          Number
                        </Typography>
                        <TextField
                          value={user.number || "-"}
                          fullWidth
                          size="small"
                          variant="outlined"
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={{
                            "& .MuiInputBase-root": {
                              fontSize: "14px",
                              borderRadius: "12px",
                              backgroundColor: "#f9f9f9",
                            },
                          }}
                        />
                      </Grid>
                    </React.Fragment>
                  ))}
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseViewDetailsDialog}
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
            Close
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Ledger Mapping Dialog */}
      <Dialog
        open={openLedgerMappingDialog}
        onClose={handleCloseLedgerMappingDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: 300,
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
          <Link size={22} />
          Link Ledger
          <IconButton
            onClick={handleCloseLedgerMappingDialog}
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
                Dealer Name
              </Typography>
              <TextField
                value={selectedDealer?.displayName || ""}
                fullWidth
                size="small"
                variant="outlined"
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "14px",
                    borderRadius: "12px",
                    backgroundColor: "#f9f9f9",
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
                Select Ledger *
              </Typography>
              {isLoadingLedgers ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Autocomplete
                  options={ledgers}
                  getOptionLabel={(option) => option.ledgerName || ""}
                  value={selectedLedger}
                  onChange={(event, newValue) => {
                    setSelectedLedger(newValue);
                    setLedgerValidationError(false); // Reset error when user selects
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select a ledger"
                      size="small"
                      variant="outlined"
                      error={ledgerValidationError && !selectedLedger}
                      helperText={ledgerValidationError && !selectedLedger ? "Please select a ledger" : ""}
                      sx={{
                        "& .MuiInputBase-root": {
                          fontSize: "14px",
                          borderRadius: "12px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: (ledgerValidationError && !selectedLedger) ? "#d32f2f" : "var(--textFieldBorderColor, #ced4da)",
                          borderRadius: "12px",
                        },
                        "& .MuiFormHelperText-root": {
                          color: "#d32f2f",
                          fontSize: "12px",
                          margin: "4px 0 0 0",
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {option.ledgerName}
                        </Typography>
                        {option.parentGroup && (
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            {option.parentGroup}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                  isOptionEqualToValue={(option, value) => 
                    option.ledgerGUID === value?.ledgerGUID
                  }
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseLedgerMappingDialog}
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
            onClick={handleLedgerMappingSubmit}
            disabled={isCreatingMapping}
            sx={{
              backgroundColor: "var(--purpleShadeBg)",
              color: "#fff !important", 
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
              "&:disabled": {
                backgroundColor: "var(--purpleShadeBg)",
                color: "#fff !important",
                opacity: 0.7,
              },
            }}
          >
            {isCreatingMapping ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Submit"
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