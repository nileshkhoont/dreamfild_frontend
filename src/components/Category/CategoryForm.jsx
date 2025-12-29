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
} from "@mui/material";
import { List, Type, FileText } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "../../API/category";

const CategoryForm = ({ open, handleClose, refetch, editData }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  const isEditMode = !!editData;

  // Populate form when editData is provided
  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
      setDescription(editData.description || "");
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!name) {
      setFormError("Category name is required");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isEditMode) {
        // Update existing record
        res = await updateCategory({
          id: editData.id,
          name,
          description,
        }).unwrap();
      } else {
        // Add new record
        res = await createCategory({
          name,
          description,
        }).unwrap();
      }

      if (res?.statusCode === 200 || res?.success) {
        setName("");
        setDescription("");
        setFormError("");
        if (typeof refetch === "function") refetch();
        handleClose();
        setSnackbarMsg(
          res.message ||
            `Category ${isEditMode ? "updated" : "created"} successfully!`
        );
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMsg(
        error?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} category`
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
      setName("");
      setDescription("");
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
          <List size={22} />
          {isEditMode ? "Edit Category" : "Add Category"}
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
            mt: 3,
            px: 3,
            py: 2,
            background: "rgba(255,255,255,0.95)",
            borderRadius: 3,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Name Field */}
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
                Name <span style={{ color: "#d32f2f" }}>*</span>
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter category name"
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
                      <Type size={18} color="#888" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Description Field */}
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
                Description
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter category description"
                multiline
                rows={3}
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
                    <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                      <FileText size={18} color="#888" />
                    </InputAdornment>
                  ),
                }}
              />

              {formError && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "#d32f2f",
                    fontSize: "13px",
                    textAlign: "left",
                    mt: -1,
                  }}
                >
                  {formError}
                </Typography>
              )}
            </Box>
          </form>
        </DialogContent>

        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
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
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              backgroundColor: "var(--purpleShadeBg)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "6px 16px",
              fontWeight: 600,
              fontSize: 14,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "var(--purpleShadeBg)",
                boxShadow: "0 2px 8px rgba(80, 60, 180, 0.3)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : isEditMode ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
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

export default CategoryForm;
