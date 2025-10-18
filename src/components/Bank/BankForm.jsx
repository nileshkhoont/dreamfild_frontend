import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  Building2,
  CreditCard,
  User,
  MapPin,
  Hash,
  Smartphone,
} from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import {
  useAddBankMutation,
  useUpdateBankMutation,
} from "../../apiService";

const BankForm = ({ open, handleClose, refetch, editData }) => {
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    branchCode: "",
    ifscCode: "",
    upiId: "",
    address: "",
    branchName: "",
  });
  const [formError, setFormError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);
  const [addBank] = useAddBankMutation();
  const [updateBank] = useUpdateBankMutation();

  const isEditMode = !!editData;

  // Populate form when editData is provided
  useEffect(() => {
    if (editData) {
      setFormData({
        bankName: editData.bankName || "",
        accountNumber: editData.accountNumber || "",
        accountHolderName: editData.accountHolderName || "",
        branchCode: editData.branchCode || "",
        ifscCode: editData.ifscCode || "",
        upiId: editData.upiId || "",
        address: editData.address || "",
        branchName: editData.branchName || "",
      });
    }
  }, [editData]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    setFormError("");
  };

  const validateForm = () => {
    if (!formData.bankName.trim()) {
      setFormError("Bank name is required");
      return false;
    }
    if (!formData.accountNumber.trim()) {
      setFormError("Account number is required");
      return false;
    }
    if (!formData.accountHolderName.trim()) {
      setFormError("Account holder name is required");
      return false;
    }
    if (!formData.ifscCode.trim()) {
      setFormError("IFSC code is required");
      return false;
    }
    if (!formData.branchName.trim()) {
      setFormError("Branch name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isEditMode) {
        res = await updateBank({
          id: editData.id,
          ...formData,
        }).unwrap();
      } else {
        res = await addBank(formData).unwrap();
      }

      if (res?.statusCode === 200) {
        setFormData({
          bankName: "",
          accountNumber: "",
          accountHolderName: "",
          branchCode: "",
          ifscCode: "",
          upiId: "",
          address: "",
          branchName: "",
        });
        setFormError("");
        if (typeof refetch === "function") refetch();
        handleClose();
        setSnackbarMsg(
          res.message || `Bank ${isEditMode ? "updated" : "added"} successfully!`
        );
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMsg(
        error?.data?.message || `Failed to ${isEditMode ? "update" : "add"} bank`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        bankName: "",
        accountNumber: "",
        accountHolderName: "",
        branchCode: "",
        ifscCode: "",
        upiId: "",
        address: "",
        branchName: "",
      });
      setFormError("");
      setSnackbarOpen(false);
      setSnackbarMsg("");
    }
  }, [open]);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
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
          <Building2 size={22} />
          {isEditMode ? "Edit Bank Account" : "Add Bank Account"}
          <IconButton
            onClick={handleClose}
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
            background: "rgba(255,255,255,0.95)",
            borderRadius: 3,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Bank Name */}
              <Grid item xs={12} sm={6}>
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
                  Bank Name *
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.bankName}
                  onChange={handleChange("bankName")}
                  required
                  placeholder="Enter bank name"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
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
                        borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                        borderWidth: 1,
                      },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Building2 size={18} color="#888" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Account Number */}
              <Grid item xs={12} sm={6}>
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
                  Account Number *
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.accountNumber}
                  onChange={handleChange("accountNumber")}
                  required
                  placeholder="Enter account number"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
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
                        borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                        borderWidth: 1,
                      },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCard size={18} color="#888" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Account Holder Name */}
              <Grid item xs={12} sm={6}>
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
                  Account Holder Name *
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.accountHolderName}
                  onChange={handleChange("accountHolderName")}
                  required
                  placeholder="Enter account holder name"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
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
                        borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                        borderWidth: 1,
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

              {/* IFSC Code */}
              <Grid item xs={12} sm={6}>
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
                  IFSC Code *
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.ifscCode}
                  onChange={handleChange("ifscCode")}
                  required
                  placeholder="Enter IFSC code"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
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
                        borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                        borderWidth: 1,
                      },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Hash size={18} color="#888" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Branch Name */}
              <Grid item xs={12} sm={6}>
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
                  Branch Name *
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.branchName}
                  onChange={handleChange("branchName")}
                  required
                  placeholder="Enter branch name"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
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
                        borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                        borderWidth: 1,
                      },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MapPin size={18} color="#888" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Branch Code */}
              <Grid item xs={12} sm={6}>
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
                  Branch Code
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.branchCode}
                  onChange={handleChange("branchCode")}
                  placeholder="Enter branch code"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
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
                        borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                        borderWidth: 1,
                      },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Hash size={18} color="#888" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* UPI ID */}
              <Grid item xs={12} sm={6}>
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
                  UPI ID
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.upiId}
                  onChange={handleChange("upiId")}
                  placeholder="Enter UPI ID"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
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
                        borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                        borderWidth: 1,
                      },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Smartphone size={18} color="#888" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {formError && (
              <Typography
                variant="body2"
                color="error"
                sx={{ mt: 2, fontSize: "13px" }}
              >
                {formError}
              </Typography>
            )}
          </form>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
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
            type="submit"
            disabled={loading}
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
              "& .MuiCircularProgress-root": {
                color: "#fff",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" sx={{ color: "#fff" }} />
            ) : isEditMode ? (
              "Update Bank"
            ) : (
              "Add Bank"
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BankForm;
