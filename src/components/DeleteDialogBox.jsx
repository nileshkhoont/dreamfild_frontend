import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// Accept props from parent
const DeleteDialogBox = ({
  deleteDialogOpen,
  handleCancelDelete,
  handleConfirmDelete,
  isDeleting,
  name,
  message, // <-- Accept message prop
  confirmText, // <-- Accept confirmText prop
}) => {
  console.log("DeleteDialogBox name:", name); // <-- Log the name here

  React.useEffect(() => {
    if (deleteDialogOpen) {
      const timer = setTimeout(() => {
        handleCancelDelete();
      }, 1200 * 1000); // 1200 seconds
      return () => clearTimeout(timer);
    }
  }, [deleteDialogOpen, handleCancelDelete]);

  return (
    <Dialog
      open={deleteDialogOpen}
      onClose={handleCancelDelete}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          maxWidth: 380,
          width: "100%",
          p: 2,
          backgroundColor: "#ffffff",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 0,
          fontSize: "1.15rem",
          fontWeight: 600,
          color: "#1e1e1e",
        }}
      >
        Confirm this operation.
      </DialogTitle>

      <DialogContent sx={{ p: 0, mt: 1.2 }}>
        <Typography
          sx={{
            fontSize: "0.925rem",
            color: "#4a4a4a",
            lineHeight: 1.5,
          }}
        >
          {message || (<>This will permanently delete the {" "} <b>{name}</b>.</>)}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          mt: 2,
          p: 0,
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        <Button
          onClick={handleCancelDelete}
          sx={{
            px: 2.5,
            py: 1,
            borderRadius: 1.5,
            fontSize: "0.875rem",
            textTransform: "none",
            backgroundColor: "#f3f3f3",
            color: "#333",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "#eaeaea",
            },
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleConfirmDelete}
          disabled={isDeleting}
          sx={{
            px: 2.5,
            py: 1,
            borderRadius: 1.5,
            fontSize: "0.875rem",
            textTransform: "none",
            fontWeight: 500,
            backgroundColor: "#e53935",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#d32f2f",
            },
            "&:disabled": {
              backgroundColor: "rgba(229, 57, 53, 0.6)",
            },
          }}
        >
          {isDeleting ? "Deleting…" : confirmText || "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialogBox;