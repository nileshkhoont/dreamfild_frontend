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
  CircularProgress,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { Building2, Plus, Edit2, Trash2 } from "lucide-react";
import {
  useGetBanksQuery,
  useDeleteBankMutation,
} from "../../apiService";
import BankForm from "./BankForm";

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

const Bank = () => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { data, isLoading, refetch } = useGetBanksQuery();
  const [deleteBank, { isLoading: isDeleting }] = useDeleteBankMutation();

  const banks = data?.data || [];

  const handleOpen = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleClose = () => {
    setEditData(null);
    setOpen(false);
  };

  const handleEdit = (item) => {
    setEditData(item);
    setOpen(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteBank(itemToDelete.id).unwrap();
      setSnackbar({
        open: true,
        message: "Bank deleted successfully!",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to delete",
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
                  <Building2 size={22} color="var(--textColor)" />
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
                    Bank Accounts
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
                  onClick={handleOpen}
                >
                  Add Bank
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
          ) : banks.length === 0 ? (
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
              <Building2 size={48} color="#ccc" />
              <Typography variant="body1" sx={{ color: "#666" }}>
                No banks found
              </Typography>
            </Box>
          ) : (
            <StyledTableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bank Name</TableCell>
                    <TableCell>Account Number</TableCell>
                    <TableCell>Account Holder</TableCell>
                    <TableCell>IFSC Code</TableCell>
                    <TableCell>Branch Name</TableCell>
                    <TableCell>Branch Code</TableCell>
                    <TableCell>UPI ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {banks.map((bank) => (
                    <TableRow key={bank.id}>
                      <TableCell sx={{ fontWeight: 500 }}>{bank.bankName}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>
                        {bank.accountNumber}
                      </TableCell>
                      <TableCell>{bank.accountHolderName}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>
                        {bank.ifscCode}
                      </TableCell>
                      <TableCell>{bank.branchName}</TableCell>
                      <TableCell>{bank.branchCode}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>
                        {bank.upiId}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={bank.status}
                          color={getStatusColor(bank.status)}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 500,
                            borderRadius: "8px",
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(bank)}
                              sx={{
                                color: "var(--purpleShadeBg)",
                                "&:hover": {
                                  backgroundColor: "rgba(80, 60, 180, 0.1)",
                                },
                              }}
                            >
                              <Edit2 size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(bank)}
                              sx={{
                                color: "#d32f2f",
                                "&:hover": {
                                  backgroundColor: "rgba(211, 47, 47, 0.1)",
                                },
                              }}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          )}
        </CardContent>
      </Card>

      <BankForm
        open={open}
        handleClose={handleClose}
        refetch={refetch}
        editData={editData}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: 18,
            color: "#d32f2f",
            pb: 1,
          }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "#666" }}>
            Are you sure you want to delete this bank account?
          </Typography>
          {itemToDelete && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Bank: {itemToDelete.bankName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                Account: {itemToDelete.accountNumber}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                Holder: {itemToDelete.accountHolderName}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              fontWeight: 600,
              fontSize: 14,
              borderRadius: "10px",
              textTransform: "none",
              color: "var(--textColor)",
              border: "1px solid #e0e0e0",
              padding: "6px 16px",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            sx={{
              backgroundColor: "#d32f2f",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "6px 16px",
              fontWeight: 600,
              fontSize: 14,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#b71c1c",
                boxShadow: "0 2px 8px rgba(211, 47, 47, 0.3)",
              },
            }}
          >
            {isDeleting ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Delete"
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

export default Bank;
