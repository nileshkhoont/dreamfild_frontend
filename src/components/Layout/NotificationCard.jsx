import { CheckCircleOutline, CancelOutlined, CalendarToday } from "@mui/icons-material";
import { BiTask } from "react-icons/bi";
import CakeIcon from "@mui/icons-material/Cake";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { Box } from "@mui/material";

const NotificationCard = ({ message, status, refType, type }) => {
  let icon = null;
  let iconColor = "#1976d2"; // Default blue

  if (refType === "Task" || type === "taskAssigned") {
    icon = <BiTask size={22} color={iconColor} />;
  } else if (type === "birthday") {
    icon = <CakeIcon sx={{ color: "#f59e0b", fontSize: 22 }} />;
  } else if (type === "anniversary") {
    icon = <WorkspacePremiumIcon sx={{ color: "#6366f1", fontSize: 22 }} />;
  } else if (refType === "Leave" || type === "leaveStatusUpdate") {
    if (status === "approved") {
      icon = <CheckCircleOutline sx={{ color: "var(--successTextColor, #28c76f)", fontSize: 22 }} />;
    } else {
      icon = <CancelOutlined sx={{ color: "var(--redShadeColor, #ff4d52)", fontSize: 22 }} />;
    }
  } else {
    icon = <CalendarToday sx={{ fontSize: 20, color: "#6b7280" }} />; // Fallback icon
  }

  const label = refType || type;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: "10px 16px",
        backgroundColor: "#F5F5F5",
        borderBottom: "1px solid #e5e7eb",
        borderRadius: "10px",
        minHeight: 44,
        fontSize: "0.9rem",
        color: "var(--textColor, #191919)",
        fontWeight: 500,
        width: "100%",
      }}
    >
      {icon}

      <Box
        sx={{
          flex: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {message}
      </Box>

      {label && (
        <Box
          sx={{
            ml: 2,
            px: 1.5,
            py: 0.5,
            borderRadius: "8px",
            fontSize: "0.75rem",
            fontWeight: 600,
            background:
              refType === "Task"
                ? "#e3f2fd"
                : refType === "Leave"
                ? "#e8f5e9"
                : "#e3e8ff",
            color:
              refType === "Task"
                ? "#1976d2"
                : refType === "Leave"
                ? "#388e3c"
                : "#3b5bdb",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}
        >
          {label}
        </Box>
      )}
    </Box>
  );
};

export default NotificationCard;
