import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  IconButton,
  Snackbar,
  Button
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  useGetAllNotificationsByUserIdWithDeletedQuery,
  useMarkNotificationsAsReadMutation,

} from "../../API/notification";
import {
  Bell,
  Clock,
  ClipboardList,
  ClipboardCheck,
  Users,
  Gift,
  CalendarHeart,
  Sparkles,
} from "lucide-react";
import "../../App.css"
import { CustomLoader } from "../Layout/CustomLoader";
import MuiAlert from "@mui/material/Alert";
import { Check, Close } from "@mui/icons-material";
import { ConfirmationDialog } from "../Layout/ConfirmationDialog"; // <-- import dialog
import { useUpdateLeaveStatusMutation } from "../../apiService";

// Styled components
const Container = styled(Box)({
  minHeight: "80vh",
  backgroundColor: "#f8fafc",
});

const StyledCard = styled(Card)({
  borderRadius: 10,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  marginTop: 56,
  height: "80vh",
  overflowY: "auto",
});

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const getNotificationStyle = (refTypeOrType) => {
  switch (refTypeOrType) {
    case "Leave":
      return { icon: <ClipboardList size={20} color="#b54708" />, bg: "#fef9e7" }; // Burnt Amber, Light Buff
    case "Task":
      return { icon: <ClipboardCheck size={20} color="#0f766e" />, bg: "#f4f9f4" }; // Teal, Light Mint
    case "birthday":
      return { icon: <Gift size={20} color="#c026d3" />, bg: "#fef6fb" }; // Orchid, Light Rose
    case "anniversary":
      return { icon: <CalendarHeart size={20} color="#1e3a8a" />, bg: "#f5f8fc" }; // Navy, Light Azure
    default:
      return { icon: <Bell size={20} color="#64748b" />, bg: "#f9fafb" };
  }
};

const NotificationItem = ({
  _id,
  message,
  leaveId,
  createdAt,
  status,
  refType,
  type,
  onApprove,
  onReject,
  showActions,
  isAdmin,
  reason,
}) => {
  const notificationType = refType || type;
  const { icon, bg } = getNotificationStyle(notificationType);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        p: 2,
        backgroundColor: bg,
        borderRadius: "12px",
        mb: 1.2,
    
      
        // Removed hover effect
      }}
    >
      <Box
        sx={{
          mt: 0.5,
          mr: 1,
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 500, color: "#1e293b" }}>
          {message}
        </Typography>

        <Typography
          variant="caption"
          sx={{ mt: 0.5, display: "block", color: "#6b7280" }}
        >
          {formatDate(createdAt)}{" "}
          <strong
            style={{
              color:
                status === "approved"
                  ? "#16a34a"
                  : status === "rejected"
                  ? "#dc2626"
                  : status === "completed"
                  ? "#16a34a"
                  : "#6b7280",
              textTransform: "capitalize",
              fontWeight: 600,
              marginLeft: 4,
            }}
          >
            {status === "completed" ? "Completed" : status}
          </strong>
        </Typography>

        {isAdmin && refType === "Leave" && reason && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.4,
              color: "#4b5563",
              fontStyle: "italic",
            }}
          >
            Reason: {reason}
          </Typography>
        )}
      </Box>

      {showActions && isAdmin && status === "pending" && (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => onApprove(_id, leaveId)}
            sx={{
              color: "success.main",
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px solid",
              borderColor: "success.main",
              "&:hover": {
                bgcolor: "success.main",
                color: "#fff",
              },
            }}
          >
            <Check fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onReject(_id, leaveId)}
            sx={{
              color: "error.main",
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px solid",
              borderColor: "error.main",
              "&:hover": {
                bgcolor: "error.main",
                color: "#fff",
              },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

const Notification = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { data, isLoading, isError, refetch } = useGetAllNotificationsByUserIdWithDeletedQuery(
    user?._id,
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      // pollingInterval: 10000, // Uncomment for polling every 10s
    }
  );
  const notifications = data?.notifications || [];
  const [markNotificationsAsRead, { isLoading: isMarking }] = useMarkNotificationsAsReadMutation();
  const [updateLeaveStatus, { isLoading: isUpdating }] = useUpdateLeaveStatusMutation();

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });

  // Confirmation dialog state
  const [dialog, setDialog] = useState({
    open: false,
    notificationId: null,
    actionType: "",
    loading: false,
  });

  // Add localStatuses state
  const [localStatuses, setLocalStatuses] = useState({});

  // Handler for marking all as read
  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
    if (unreadIds.length > 0) {
      try {
        const res = await markNotificationsAsRead({ ids: unreadIds }).unwrap();
        setSnackbar({ open: true, message: res.message || "Marked as read", severity: "success" });
        refetch();
      } catch (e) {
        setSnackbar({ open: true, message: e?.data?.message || "Failed to mark as read", severity: "error" });
      }
    }
  };

  // Open confirmation dialog for approve/reject
  const handleApprove = (notificationId, leaveId) => {
    setDialog({
      open: true,
      notificationId,
      leaveId, // <-- now defined!
      actionType: "approved",
      loading: false,
    });
  };

  const handleReject = (notificationId, leaveId) => {
    setDialog({
      open: true,
      notificationId,
      leaveId, // <-- now defined!
      actionType: "rejected",
      loading: false,
    });
  };

  // Confirm approve/reject
  const handleDialogConfirm = async (comment) => {
    setDialog((prev) => ({ ...prev, loading: true }));
    try {
      const res = await updateLeaveStatus({
        leaveId: dialog.leaveId,
        status: dialog.actionType,
        comment,
      }).unwrap();

      // Optimistically update local status
      setLocalStatuses((prev) => ({
        ...prev,
        [dialog.notificationId]: dialog.actionType,
      }));

      setSnackbar({
        open: true,
        message: res.responseMessage,
        severity: "success",
      });
      setDialog({ open: false, notificationId: null, leaveId: null, actionType: "", loading: false });
      refetch();
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.data?.responseMessage || `Failed to ${dialog.actionType} leave`,
        severity: "error",
      });
      setDialog({ ...dialog, loading: false });
    }
  };

  // Close dialog
  const handleDialogClose = () => {
    setDialog({ open: false, notificationId: null, actionType: "", loading: false });
  };

  const isAdmin = user?.role === "admin";

  return (
    <Container>
      <StyledCard>
        <Box sx={{ p: { xs: 2, sm: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
           
         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Bell size={22} color="var(--textColor)" />
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
                    Notificaion
                  </Typography>
                </Box>
        
           
            {notifications.some(n => !n.read) && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{
                  backgroundColor: "var(--successBgColor)",
                  color: "var(--successTextColor)",
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
                    backgroundColor: "var(--successBgColor)",
                    boxShadow: "none",
                  },
                }}
                onClick={handleMarkAllAsRead}
                disabled={isMarking}
              >
                Mark all as read
              </Button>
            )}
          </Box>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CustomLoader />
            </Box>
          ) : isError ? (
            <Typography color="error">Failed to load notifications.</Typography>
          ) : notifications.length === 0 ? (
            <Box sx={{ textAlign: "center", mt: 8 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.5,
                  mx: "auto",
                  opacity: 0.8,
                }}
              >
                <Bell size={28} color="#757575" />
              </Box>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                No notifications to display.
              </Typography>
              <Typography variant="body2" sx={{ color: "#9ca3af", mt: 0.5 }}>
                You're all caught up!
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0}>
              {notifications.map((noti) => {
                // Use local status if present, else original
                const effectiveStatus = localStatuses[noti._id] || noti.status;
                return (
                  <NotificationItem
                    key={noti._id}
                    leaveId={noti.refId}
                    _id={noti._id}
                    message={noti.message}
                    createdAt={noti.createdAt}
                    status={effectiveStatus}
                    refType={noti.refType}
                    type={noti.type}
                    showActions={noti.refType === "Leave"}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isAdmin={isAdmin}
                    reason={noti.meta?.reason}
                  />
                );
              })}
            </Stack>
          )}
        </Box>
      </StyledCard>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={dialog.open}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        title={dialog.actionType === "approved" ? "Approve Leave" : "Reject Leave"}
        message={`Are you sure you want to ${dialog.actionType} this leave request?`}
        confirmText={dialog.actionType === "approved" ? "Approve" : "Reject"}
        actionType={dialog.actionType}
        loading={dialog.loading}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ zIndex: 9999 }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            fontSize: "15px",
            borderRadius: "8px",
            boxShadow: "none",
            backgroundColor:
              snackbar.severity === "success"
                ? "#e6f4ea"
                : snackbar.severity === "error"
                  ? "#fdecea"
                  : snackbar.severity === "info"
                    ? "#e3f2fd"
                    : undefined,
            color:
              snackbar.severity === "success"
                ? "#166534"
                : snackbar.severity === "error"
                  ? "#b91c1c"
                  : snackbar.severity === "info"
                    ? "#0b5394"
                    : undefined,
          }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>


    </Container>
  );
};

export default Notification;
