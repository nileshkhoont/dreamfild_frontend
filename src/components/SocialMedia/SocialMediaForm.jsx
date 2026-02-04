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
  MenuItem,
} from "@mui/material";
import { Share2, Link as LinkIcon } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import {
  useAddSocialMediaMutation,
  useUpdateSocialMediaMutation,
} from "../../apiService";

const socialPlatforms = [
  { value: "Facebook", label: "Facebook" },
  { value: "Instagram", label: "Instagram" },
  { value: "Twitter", label: "Twitter" },
  { value: "X", label: "X (Twitter)" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "YouTube", label: "YouTube" },
  { value: "TikTok", label: "TikTok" },
  { value: "Pinterest", label: "Pinterest" },
  { value: "Snapchat", label: "Snapchat" },
  { value: "Reddit", label: "Reddit" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Telegram", label: "Telegram" },
  { value: "Discord", label: "Discord" },
  { value: "Other", label: "Other" },
];

const SocialMediaForm = ({ open, handleClose, refetch, editData }) => {
  const [platform, setPlatform] = useState("");
  const [url, setUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);
  const [addSocialMedia] = useAddSocialMediaMutation();
  const [updateSocialMedia] = useUpdateSocialMediaMutation();

  const isEditMode = !!editData;

  // Populate form when editData is provided
  useEffect(() => {
    if (editData) {
      setPlatform(editData.platform || "");
      setUrl(editData.url || "");
    }
  }, [editData]);

  const validateUrl = (urlString) => {
    try {
      // Add protocol if not present
      if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
        urlString = "https://" + urlString;
      }
      new URL(urlString);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!platform || !url) {
      setFormError("Please fill in all fields");
      return;
    }

    if (!validateUrl(url)) {
      setFormError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isEditMode) {
        // Update existing record
        res = await updateSocialMedia({
          id: editData.id,
          platform,
          url,
        }).unwrap();
      } else {
        // Add new record
        res = await addSocialMedia({
          platform,
          url,
        }).unwrap();
      }

      if (res?.statusCode === 200) {
        setPlatform("");
        setUrl("");
        setFormError("");
        if (typeof refetch === "function") refetch();
        handleClose();
        setSnackbarMsg(
          res.message ||
            `Social media link ${isEditMode ? "updated" : "added"} successfully!`
        );
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMsg(
        error?.data?.message ||
          `Failed to ${isEditMode ? "update" : "add"} social media link`
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
      setPlatform("");
      setUrl("");
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
          <Share2 size={22} />
          {isEditMode ? "Edit Social Media Link" : "Add Social Media Link"}
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
              {/* Platform Field */}
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
                Platform
              </Typography>
              <TextField
                select
                variant="outlined"
                size="small"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                required
                placeholder="Select platform"
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
                      <Share2 size={18} color="#888" />
                    </InputAdornment>
                  ),
                }}
              >
                {socialPlatforms.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* URL Field */}
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
                URL
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                placeholder="Enter URL (e.g., www.facebook.com/yourpage)"
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
                      <LinkIcon size={18} color="#888" />
                    </InputAdornment>
                  ),
                }}
              />

              {formError && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ mt: 1, fontSize: "13px" }}
                >
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
            ) : isEditMode ? (
              "Update Link"
            ) : (
              "Add Link"
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

export default SocialMediaForm;
