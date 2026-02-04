import React, { useState } from "react";
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
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { FileText, UploadCloud, X } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import { useUploadDocumentMutation } from "../../apiService"; // Adjust the import path as necessary

const DocumentForm = ({ open, handleClose, onSubmit, refetch }) => {
  const [docName, setDocName] = useState("");
  const [documents, setDocuments] = useState([]);
  const [formError, setFormError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadDocument] = useUploadDocumentMutation();

  const userId = JSON.parse(localStorage.getItem("user"))?._id;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];

    let validFiles = [];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setFormError(`Invalid file type: ${file.name}`);
        return;
      }
      if (file.size > maxSize) {
        setFormError(`File too large: ${file.name}`);
        return;
      }
      validFiles.push(file);
    }
    setDocuments((prev) => [...prev, ...validFiles]);
    setFormError("");
  };

  const removeDocument = (indexToRemove) => {
    setDocuments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docName || documents.length === 0) return;
    setLoading(true);
    try {
      const res = await uploadDocument({
        userId,
        documentName: docName,
        document: documents[0],
      });
      if (res?.data?.success) {
        setDocName("");
        setDocuments([]);
        setFormError("");
        if (typeof refetch === "function") refetch();
        handleClose(); // <-- Close dialog immediately
        setSnackbarMsg(res.data.message);
        setSnackbarOpen(true);
        // No need for setTimeout to close dialog, it's already closed
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setDocName("");
      setDocuments([]);
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
            minHeight: 420,
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
          <FileText size={22} />
          Add Document
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
              {/* Custom label for Document Name */}
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
                Document Name
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
                placeholder="Enter document name"
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
                      <FileText size={18} color="#888" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Custom label for Upload Documents */}
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
                Upload Documents
              </Typography>
              <Box
                sx={{
                  borderRadius: "12px",
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  minHeight: "120px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "transparent",
                  transition: "all 0.3s ease",
                  border: "1px  #bdbdbd",
                  "&:hover": {
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.05)",
                  },
                }}
                component="label"
              >
                <UploadCloud size={32} color="var(--purpleShadeBg)" />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6b7280",
                    fontSize: "12px",
                    display: "block",
                    mt: 0.5,
                  }}
                >
                  PDF, DOC, DOCX, Images (Max 10MB each)
                </Typography>
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleFileChange}
                />
              </Box>

              {/* Show selected documents as chips */}
              {documents.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#374151",
                      mb: 1,
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    Selected Documents ({documents.length}):
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      maxHeight: "100px",
                      overflowY: "auto",
                    }}
                  >
                    {documents.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        variant="outlined"
                        size="small"
                        onDelete={() => removeDocument(index)}
                        deleteIcon={<X size={14} />}
                        sx={{
                          maxWidth: "180px",
                          height: "32px",
                          fontSize: "12px",
                          borderColor: "var(--textFieldBorderColor, #ced4da)",
                          color: "#374151",
                          backgroundColor: "rgba(59, 130, 246, 0.08)",
                          borderRadius: "12px",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {formError && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {formError}
                </Typography>
              )}
            </Box>
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
            ) : (
              "Upload"
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }} // <-- top right
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DocumentForm;