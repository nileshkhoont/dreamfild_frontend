import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { UserCheck, FileCheck, Calendar, User } from "lucide-react";

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  actionType = "approved",
  loading = false,
  reqType = "leave", // leave, wfh, or punchout
  date,
  userName,
  requestedTime, // Add requestedTime prop
}) {
  const [comment, setComment] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setComment("");
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(comment);
  };

  const getIconComponent = () => {
    if (reqType === "wfh") return UserCheck;
    if (reqType === "punchout") return FileCheck;
    return Calendar; // default for leave
  };

  const IconComponent = getIconComponent();

  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    // If it's already in a readable format, return it
    if (typeof dateStr === "string" && dateStr.includes("-")) {
      return dateStr;
    }

    try {
      const date = new Date(dateStr);
      if (isNaN(date)) return dateStr;

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const getDialogTitle = () => {
    if (reqType === "wfh") {
      return `${
        actionType === "approved" ? "Approve" : "Reject"
      } Work From Home Request`;
    } else if (reqType === "punchout") {
      return `${
        actionType === "approved" ? "Approve" : "Reject"
      } Punch Correction Request`;
    } else {
      return `${
        actionType === "approved" ? "Approve" : "Reject"
      } Leave Request`;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 2,
          minWidth: { xs: "90%", sm: 400 },
          maxWidth: "500px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          color: "var(--textColor)",
          fontSize: "1.25rem",
          py: 2,
          px: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            width: 42,
            height: 42,
            bgcolor:
              actionType === "approved"
                ? "var(--successBgColor)"
                : "var(--redShadeBg)",
            color:
              actionType === "approved"
                ? "var(--successTextColor)"
                : "var(--redShadeColor)",
          }}
        >
          <IconComponent size={24} />
        </Box>
        {getDialogTitle()}
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 2 }}>
        
        <Typography sx={{ mb: 1.5, color: "var(--textColor)", opacity: 0.9 }}>
          {message ||
            `Are you sure you want to ${
              actionType === "approved" ? "approve" : "reject"
            } this ${
              reqType === "wfh"
                ? "work from home"
                : reqType === "punchout"
                ? `punch correction request for ${formatDate(date)}`
                : "leave"
            }${reqType !== "punchout" ? " request" : ""}?`}
        </Typography>

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginTop: "8px",
          }}
        >
          <label
            htmlFor="comment-input"
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--textColor, #374151)",
              marginBottom: "4px",
            }}
          >
            Comment{" "}
            {actionType === "rejected" ? (
              <span style={{ color: "#f44336" }}>*</span>
            ) : (
              "(Optional)"
            )}
          </label>
          <textarea
            id="comment-input"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: "14px",
              fontFamily: "inherit",
              borderRadius: "12px",
              border: "1px solid var(--textFieldBorderColor, #ced4da)",
              outline: "none",
              resize: "vertical",
              backgroundColor: "#fff",
              color: "var(--textColor, #374151)",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor =
                "var(--textFieldFocusBorderColor, #343a40)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor =
                "var(--textFieldBorderColor, #ced4da)";
            }}
            placeholder="Add a comment (optional)"
          />
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 600,
            fontSize: 15,
            borderRadius: "12px",
            textTransform: "none",
            color: "var(--textColor)",
            border: "1px solid var(--textFieldBorderColor, #ced4da)",
            padding: "8px 20px",
            boxShadow: "none",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          sx={{
            backgroundColor:
              actionType === "approved"
                ? "var(--successTextColor)"
                : "var(--redShadeColor)",
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
              backgroundColor:
                actionType === "approved"
                  ? "var(--successTextColorDark, #1b5e20)"
                  : "var(--redShadeColorDark, #b71c1c)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            },
            "&.Mui-disabled": {
              bgcolor: "#e0e0e0",
              color: "#9e9e9e",
            },
          }}
        >
          {loading ? "Processing..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
