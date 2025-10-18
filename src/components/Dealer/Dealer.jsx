import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  useGetDealersQuery,
  useRegisterDealerMutation,
  useUpdateDealerStatusMutation,
  useAddDealerUserMutation,
} from "../../apiService";

const Container = styled(Box)({
  margin: "0 auto",
  paddingTop: "2rem",
  height: "88vh", // Make the container take full viewport height
  display: "flex",
  flexDirection: "column",
});
const StyledTableContainer = styled(TableContainer)({
  borderRadius: 16,
  border: "none",
  maxHeight: "65vh", // Set a max height for the table area
  overflow: "auto", // Enable scrolling for the table area
  "& .MuiTableCell-head": {
    backgroundColor: "var(--tableHeaderBackgroundColor)",
    fontWeight: 600,
    color: "var(--textColor)",
    borderBottom: "none",
    position: "sticky",
    top: 0,
    zIndex: 2,
  },
  "& .MuiTableCell-root": { borderBottom: "none", borderRight: "none" },
  "& .MuiTableRow-root:hover": {
    backgroundColor: "#f5f5f5",
    transition: "background-color 0.3s ease",
  },
});

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    minWidth: 180,
    padding: theme.spacing(1),
  },
}));

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
  const [statusLoading, setStatusLoading] = useState(false);

  // Refetch dealers after status change or user add
  const { data, isLoading, refetch } = useGetDealersQuery({ page: page + 1, limit: rowsPerPage });
  const [registerDealer, { isLoading: isSubmitting }] = useRegisterDealerMutation();
  const [updateDealerStatus, { isLoading: isStatusUpdating }] = useUpdateDealerStatusMutation();
  const [addDealerUser, { isLoading: isUserAdding }] = useAddDealerUserMutation();

  const dealers = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

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
      const payload = {
        displayName: formData.displayName,
        email: formData.email,
        number: formData.number,
        role: formData.role,
      };

      const response = await registerDealer(payload).unwrap();
      console.log("Dealer added successfully:", response);

      // Close the dialog and reset the form
      handleCloseDialog();
    } catch (error) {
      console.error("Error adding dealer:", error);
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

  // Update status API call (now using RTK Query)
  const handleStatusChange = async (dealerId, newStatus) => {
    setStatusLoading(true);
    try {
      await updateDealerStatus({ id: dealerId, status: newStatus }).unwrap();
      refetch();
    } catch (error) {
      alert("Failed to update status");
    }
    setStatusLoading(false);
    handleCloseMenu();
  };

  const handleOpenAddUserDialog = () => {
    setOpenAddUserDialog(true);
    handleCloseMenu();
  };

  const handleCloseAddUserDialog = () => {
    setOpenAddUserDialog(false);
    setAddUserFormData({ displayName: "", email: "", number: "", password: "" });
  };

  // Add user API call (now using RTK Query)
  const handleAddUserSubmit = async () => {
    try {
      await addDealerUser(addUserFormData).unwrap();
      handleCloseAddUserDialog();
      refetch();
    } catch (error) {
      alert("Failed to add user");
    }
  };

  return (
    <Container>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          color: "#000",
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardHeader
          title={
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#000",
                textAlign: "left",
                fontSize: "22px",
              }}
            >
              Dealer List
            </Typography>
          }
          action={
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#000",
                color: "#fff",
                borderRadius: 2,
                textTransform: "none",
              }}
              onClick={handleOpenDialog}
            >
              Add Dealer
            </Button>
          }
        />
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <StyledTableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Number</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>GST Number</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dealers.map((dealer) => (
                      <TableRow key={dealer.id}>
                        <TableCell>{dealer.displayName}</TableCell>
                        <TableCell>{dealer.email}</TableCell>
                        <TableCell>{dealer.number}</TableCell>
                        <TableCell>{dealer.status}</TableCell>
                        <TableCell>{dealer.gstNumber || "-"}</TableCell>
                        <TableCell>{dealer.createdAt ? new Date(dealer.createdAt).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>
                          <IconButton onClick={(event) => handleOpenMenu(event, dealer.id)}>
                            <MoreVertIcon />
                          </IconButton>
                          <StyledMenu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedDealerId === dealer.id}
                            onClose={handleCloseMenu}
                            elevation={3}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "right",
                            }}
                          >
                            <MenuItem
                              onClick={() =>
                                handleStatusChange(
                                  dealer.id,
                                  dealer.status === "active" ? "deactive" : "active"
                                )
                              }
                              sx={{
                                borderRadius: 2,
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                              disabled={statusLoading}
                            >
                              <Switch
                                checked={dealer.status === "active"}
                                color="success"
                                size="small"
                                sx={{ mr: 1 }}
                                inputProps={{ "aria-label": "status switch" }}
                                disabled={statusLoading}
                              />
                              {dealer.status === "active" ? "Make Deactive" : "Make Active"}
                            </MenuItem>
                            <MenuItem
                              onClick={handleOpenAddUserDialog}
                              sx={{
                                mt: 1,
                                borderRadius: 2,
                                fontWeight: 500,
                                "&:hover": { background: "#f0f0f0" },
                              }}
                            >
                              Add User
                            </MenuItem>
                          </StyledMenu>
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
                rowsPerPageOptions={[5, 10, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Dealer Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: "#000", color: "#fff" }}>Add Dealer</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ marginTop: 2 }}>
            <Grid item xs={6}>
              <TextField
                label="Name"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Number"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: "#f5f5f5",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: "#000",
              color: "#fff",
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: "#000",
              border: "1px solid #000",
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog
        open={openAddUserDialog}
        onClose={handleCloseAddUserDialog}
        fullWidth
        maxWidth="sm"
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: "#000", color: "#fff" }}>Add User</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ marginTop: 2 }}>
            <Grid item xs={6}>
              <TextField
                label="Name"
                name="displayName"
                value={addUserFormData.displayName}
                onChange={handleAddUserInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Email"
                name="email"
                value={addUserFormData.email}
                onChange={handleAddUserInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Number"
                name="number"
                value={addUserFormData.number}
                onChange={handleAddUserInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Password"
                name="password"
                value={addUserFormData.password}
                onChange={handleAddUserInputChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: "#f5f5f5",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Button
            onClick={handleAddUserSubmit}
            variant="contained"
            sx={{
              backgroundColor: "#000",
              color: "#fff",
            }}
          >
            Submit
          </Button>
          <Button
            onClick={handleCloseAddUserDialog}
            sx={{
              color: "#000",
              border: "1px solid #000",
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dealer;
