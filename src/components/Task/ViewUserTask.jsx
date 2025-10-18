import React, { useState, useEffect, useRef } from "react";
import "react-quill/dist/quill.snow.css";
import {
  Box, Card, CardContent, Typography, Chip, Paper, IconButton, Avatar, Modal, Button,
  CircularProgress, Select, MenuItem, FormControl, TextField, Stack, Snackbar, Alert, Grid,
  InputAdornment, Dialog, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ClipboardList, Calendar, MoreHorizontal, X, Check, Edit3, Send, MessageCircle,
  Flag, Clock, Circle, Play, CheckCircle
} from "lucide-react";
import { MdAddTask } from "react-icons/md";
import {
  useSpecificUserTasksQuery, useUpdateTaskStatusMutation, useGetTaskByIdQuery,
  useAddTaskCommentMutation, useUpdateTaskMutation, useStartTaskTimeMutation,
  useEndTaskTimeMutation, useReplyToTaskCommentMutation
} from "../../API/taskApi";
import { CustomLoader, LoaderContainer } from "../Layout/CustomLoader";
import TaskForm from "./TaskForm";

// Styled Components
const Header = styled(Box)({ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", position: "sticky", top: 0, zIndex: 50 });
const BoardContainer = styled(Box)(({ theme }) => ({ padding: "24px", height: "calc(100vh - 80px)", overflowX: "hidden", overflowY: "hidden", display: "flex", alignItems: "flex-start", "& > div": { display: "flex", gap: theme.spacing(2), width: "100%", justifyContent: "space-between" }, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none", msOverflowStyle: "none" }));
const ColumnContainer = styled(Paper)(({ isDragOver }) => ({ flex: "1 1 0", minWidth: 0, backgroundColor: isDragOver ? "#f0f9ff" : "#f1f5f9", borderRadius: "8px", border: isDragOver ? "2px solid #3b82f6" : "1px solid #e2e8f0", transition: "all 0.15s ease", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", maxHeight: "calc(100vh - 120px)", margin: 0, overflowY: "auto", overflowX: "hidden", "&::-webkit-scrollbar": { width: "8px" }, "&::-webkit-scrollbar-track": { backgroundColor: "#f1f5f9", borderRadius: "4px" }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#cbd5e1", borderRadius: "4px", "&:hover": { backgroundColor: "#94a3b8" } }, scrollbarWidth: "thin", msOverflowStyle: "auto" }));
const TaskCard = styled(Card)(({ isDragging }) => ({ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", marginBottom: "8px", cursor: "grab", opacity: isDragging ? 0.5 : 1, transform: isDragging ? "rotate(2deg)" : "none", transition: "all 0.2s ease", width: "100%", "&:hover": { boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", backgroundColor: "#fafafa" } }));
const StatusChip = styled(Chip)(({ status }) => ({ fontSize: "10px", height: "20px", fontWeight: 500, textTransform: "uppercase", backgroundColor: status === "completed" ? "#dcfce7" : status === "in-progress" ? "#dbeafe" : "#f3f4f6", color: status === "completed" ? "#166534" : status === "in-progress" ? "#1e40af" : "#374151" }));
const ModalContainer = styled(Box)({ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "95%", maxWidth: 1200, backgroundColor: "#ffffff", borderRadius: "16px", boxShadow: "0 20px 40px -8px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.08)", padding: 0, outline: "none", maxHeight: "90vh", overflowY: "auto", border: "1px solid #e5e7eb" });

const statuses = [
  { key: "pending", label: "Pending", color: "#dfe1e6" },
  { key: "in-progress", label: "In Progress", color: "#0052cc" },
  { key: "completed", label: "Completed", color: "#36b37e" }
];

// Modal scrollbar styles
const modalScrollbarStyles = `.modal-scrollable-content { height: 100%; overflow-y: auto; padding-right: 18px; box-sizing: content-box; border-radius: 0 24px 24px 0; background-clip: padding-box; } .modal-scrollable-content::-webkit-scrollbar { width: 12px; background: transparent; } .modal-scrollable-content::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #e0e0e0 60%, #bdbdbd 100%); border-radius: 24px; margin: 2px; border: 3px solid transparent; background-clip: padding-box; box-shadow: 0 0 0 6px #fff inset; } .modal-scrollable-content::-webkit-scrollbar-track { background: transparent; border-radius: 24px; } .modal-scrollable-content { scrollbar-width: thin; scrollbar-color: #bdbdbd #fff; }`;

const StyledToggleButtonGroup = styled(Box)({
  display: "flex",
  backgroundColor: "#f5f5f5",
  borderRadius: "30px",
  gap: "4px",
  padding: "3px",
  border: "1px solid #e0e0e0",
});

const StyledToggleButton = styled(Button)(({ isActive }) => ({
  borderRadius: "30px",
  padding: "4px 8px",
  textTransform: "none",
  fontWeight: 500,
  fontSize: "12px",
  minWidth: "80px",
  backgroundColor: isActive ? "var(--purpleShadeBg)" : "transparent",
  color: isActive ? "white" : "#666",
  border: "none",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: isActive ? "var(--purpleShadeBg)" : "rgba(0, 0, 0, 0.04)",
    boxShadow: "none",
  },
}));

// Modal Header Component
const ModalHeader = ({ title, onClose, showToggle = false, modalView, setModalView }) => (
  <Box
    sx={{
      p: "12px 20px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <ClipboardList size={20} color="var(--textColor)" />
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "#111827",
          fontSize: "1.5rem",
          letterSpacing: "-0.025em",
        }}
      >
        {title}
      </Typography>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {showToggle && (
        <StyledToggleButtonGroup>
          <StyledToggleButton
            isActive={modalView === "details"}
            onClick={() => setModalView("details")}
          >
            Details
          </StyledToggleButton>
          <StyledToggleButton
            isActive={modalView === "logs"}
            onClick={() => setModalView("logs")}
          >
            Time Logs
          </StyledToggleButton>
        </StyledToggleButtonGroup>
      )}
      <IconButton
        onClick={onClose}
        size="small"
        sx={{ border: "none", width: 36, height: 36 }}
      >
        <X size={18} />
      </IconButton>
    </Box>
  </Box>
);

const ViewUserTask = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const { data, isLoading, refetch } = useSpecificUserTasksQuery(user?._id);
  const tasks = data?.data?.tasks || [];

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [taskStatus, setTaskStatus] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [inlineTitle, setInlineTitle] = useState("");
  const [inlineEditLoading, setInlineEditLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [localStart, setLocalStart] = useState(null);
  const [localEnd, setLocalEnd] = useState(null);
  // Add Task Modal States
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [modalView, setModalView] = useState("details"); // Add state for modal view

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [addTaskComment] = useAddTaskCommentMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [startTaskTime] = useStartTaskTimeMutation();
  const [endTaskTime] = useEndTaskTimeMutation();
  const [replyToTaskComment] = useReplyToTaskCommentMutation();

  const { data: taskDetails, isLoading: isTaskLoading } = useGetTaskByIdQuery(selectedTaskId, { skip: !selectedTaskId });

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const formatDMY = (dateStr) => {
    if (!dateStr) return "--";
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const formatDMYWithTime = (dateStr) => {
    if (!dateStr) return "--";
    const date = new Date(dateStr);
    const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "UTC", // Ensure consistent timezone formatting
    });
    return `${formattedDate} ${formattedTime}`;
  };
  const getInitials = (name) => name && name.length > 0 ? name[0].toUpperCase() : "";

  // Add Task Modal Handlers
  const handleAddTaskModalOpen = () => setAddTaskModalOpen(true);
  const handleAddTaskModalClose = () => {
    setAddTaskModalOpen(false);
    refetch(); // Refresh tasks after adding new task
  };

  // Drag handlers
  const onDragStart = (e, taskId) => { setDraggedTaskId(taskId); e.dataTransfer.effectAllowed = "move"; };
  const onDragEnd = () => setDraggedTaskId(null);
  const onDragOver = (e, statusKey) => { e.preventDefault(); setDragOverStatus(statusKey); };
  const onDragLeave = () => setDragOverStatus(null);
  const onDrop = async (e, statusKey) => {
    e.preventDefault();
    setDragOverStatus(null);
    if (draggedTaskId) {
      try {
        await updateTaskStatus({ taskId: draggedTaskId, status: statusKey }).unwrap();
      } catch (err) {
        console.error("Failed to update task status!", err);
      }
      setDraggedTaskId(null);
    }
  };

  const handleViewTask = (taskId) => { setSelectedTaskId(taskId); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedTaskId(null); setNewComment(""); setTaskStatus(""); };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTaskStatus({ taskId: selectedTaskId, status: newStatus }).unwrap();
      setTaskStatus(newStatus);
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        const res = await addTaskComment({ taskId: selectedTaskId, comment: newComment.trim() }).unwrap();
        setNewComment("");
        setSnackbarMsg(res?.message || "Comment added successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch (err) {
        setSnackbarMsg(err?.data?.message || "Failed to add comment.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  const handleInlineSave = async (field) => {
    if (inlineEditLoading) return;
    setInlineEditLoading(true);
    try {
      const res = await updateTask({ taskId: selectedTaskId, title: field === "title" ? inlineTitle.trim() : taskDetails.data.title }).unwrap();
      if (field === "title") setIsEditingTitle(false);
      setSnackbarMsg(res?.message || "Task updated successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMsg(err?.data?.message || "Failed to update task.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setInlineEditLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && taskDetails?.data?.status) setTaskStatus(taskDetails.data.status);
  }, [isModalOpen, taskDetails]);

  useEffect(() => {
    if (taskDetails?.data) setInlineTitle(taskDetails.data.title || "");
  }, [taskDetails]);

  useEffect(() => {
    if (isModalOpen && taskDetails?.data) {
      setLocalStart(taskDetails.data.startTime || null);
      setLocalEnd(taskDetails.data.endTime || null);
    }
  }, [isModalOpen, taskDetails]);

  // Add modal scrollbar styles
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = modalScrollbarStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (isLoading) return <LoaderContainer><CustomLoader /></LoaderContainer>;

  const CommentItem = ({ comment, depth = 0 }) => {
    const [replyValue, setReplyValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [showReply, setShowReply] = useState(false);
    const replyInputRef = useRef(null);
    const marginLeft = depth > 0 ? 18 * depth : 0;

    useEffect(() => {
      if (showReply && replyInputRef.current) replyInputRef.current.focus();
    }, [showReply]);

    const handleReply = async () => {
      if (!replyValue.trim()) return;
      setLoading(true);
      try {
        await replyToTaskComment({ taskId: selectedTaskId, commentId: comment._id, reply: replyValue.trim() }).unwrap();
        setReplyValue("");
        setShowReply(false);
      } catch (err) {
        console.error("Reply error:", err);
      } finally {
        setLoading(false);
      }
    };

    return (
      <Box sx={{ borderBottom: depth === 0 ? "1px solid #e5e7eb" : "none", background: "#fff", mb: 2, ml: `${marginLeft}px`, p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Avatar src={comment.userId?.profilePhoto} sx={{ width: 26, height: 26, backgroundColor: comment.userId?.profilePhoto ? "transparent" : "var(--purpleShadeBg)", fontSize: "12px", fontWeight: 600, flexShrink: 0 }}>
            {!comment.userId?.profilePhoto && getInitials(comment.userId?.name || "A")}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#222", fontSize: "12.5px", letterSpacing: 0.1 }}>
                {comment.userId?.name || "Anonymous"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#bdbdbd", fontSize: "10px", fontWeight: 400 }}>
                • {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ textAlign: "left", color: "#374151", fontSize: "12px", lineHeight: 1.45, wordBreak: "break-word", mb: 0.3 }}>
              {comment.comment}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
              <Button size="small" sx={{ p: 0, minWidth: 0, fontSize: "10.5px", textTransform: "none", color: "#60a5fa", background: "none", fontWeight: 500, borderRadius: "6px", "&:hover": { color: "#2563eb", background: "#f5faff" } }} onClick={() => setShowReply(prev => !prev)}>
                {showReply ? "Cancel" : "Reply"}
              </Button>
              {showReply && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, ml: 1, flex: 1 }}>
                  <TextField size="small" placeholder="Reply..." value={replyValue} onChange={(e) => setReplyValue(e.target.value)} inputRef={replyInputRef} disabled={loading} onKeyDown={(e) => e.key === "Enter" && replyValue.trim() && !loading && handleReply()}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" size="small" sx={{ color: replyValue.trim() ? "#60a5fa" : "#bdbdbd", borderRadius: "50%", transition: "color 0.2s", "&:hover": { color: "#2563eb", background: "#f5faff" }, p: 0.5 }} onClick={handleReply} disabled={!replyValue.trim() || loading}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="22" y1="2" x2="11" y2="13" />
                              <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ flex: 1, background: "#fafafa", borderRadius: "12px", fontSize: "14px", "& .MuiOutlinedInput-root": { borderRadius: "12px", background: "#fafafa", fontSize: "14px", paddingRight: "6px", "& fieldset": { borderColor: "var(--textFieldBorderColor, #ced4da)", borderRadius: "12px" }, "&:hover fieldset": { borderColor: "var(--textFieldBorderColor, #ced4da)" }, "&.Mui-focused fieldset": { borderColor: "var(--textFieldFocusBorderColor, #343a40)", borderWidth: 1 } }, "& .MuiInputBase-input": { padding: "8px 8px 8px 12px", fontSize: "14px", background: "#fafafa", borderRadius: "12px" } }}
                  />
                </Box>
              )}
            </Box>
            {comment.replies && comment.replies.length > 0 && (
              <Box sx={{ mt: 0.3 }}>
                {comment.replies.map(reply => <CommentItem key={reply._id} comment={reply} depth={depth + 1} />)}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Card sx={{ borderRadius: 2.5, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)", color: "var(--textColor)", mt: 7 }}>
      <Header>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ClipboardList size={22} color="var(--textColor)" />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--textColor)" }}>My Tasks</Typography>
          </Box>
          {/* Add Task Button */}
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleAddTaskModalOpen}
            sx={{
              backgroundColor: "white", color: "var(--purpleShadeBg)",
             
              borderRadius: "5px",
              fontWeight: 600,
              fontSize: "16px",
              textTransform: "none",
              px: 2,
              py: 1,
              height: "40px",
              minWidth: "120px",
              boxShadow: "none",
              "&:hover": {
                 boxShadow: "none",
              }
            }}
          >
            + Add Task
          </Button>
        </Box>
      </Header>

      <BoardContainer>
        {tasks.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center !important", alignItems: "center", height: "60vh", color: "#9ca3af" }}>
            <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.9rem", maxWidth: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Box sx={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)", display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5, opacity: 0.8 }}>
                <ClipboardList size={24} color="#757575" />
              </Box>
              No tasks available right now.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", width: "100%", gap: 2, "& > *": { flex: "1 1 0", minWidth: 0 } }}>
            {statuses.map(status => {
              const statusTasks = tasks.filter(task => task.status === status.key);
              const isDragOver = dragOverStatus === status.key;

              return (
                <ColumnContainer key={status.key} isDragOver={isDragOver} onDragOver={e => onDragOver(e, status.key)} onDragLeave={onDragLeave} onDrop={e => onDrop(e, status.key)}>
                  <Box sx={{ p: 2, pb: 1, position: "sticky", top: 0, backgroundColor: isDragOver ? "#f0f9ff" : "#f1f5f9", zIndex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>{status.label}</Typography>
                        <Chip label={statusTasks.length} size="small" sx={{ height: 20, fontSize: "11px", backgroundColor: "#d1d5db", color: "#374151", fontWeight: 500 }} />
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ p: 2, pt: 0, flex: 1, overflowY: "auto", overflowX: "hidden", "&::-webkit-scrollbar": { width: "6px" }, "&::-webkit-scrollbar-track": { backgroundColor: "#f1f5f9" }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#cbd5e1", borderRadius: "3px" } }}>
                    {statusTasks.map(task => (
                      <TaskCard key={task._id} isDragging={draggedTaskId === task._id} draggable onDragStart={e => onDragStart(e, task._id)} onDragEnd={onDragEnd} onClick={() => handleViewTask(task._id)}>
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 500, color: "#111827", lineHeight: 1.3, cursor: "pointer", "&:hover": { color: "#2563eb" }, textAlign: "left", width: "100%" }}>{task.title}</Typography>
                            <IconButton size="small" sx={{ opacity: 0, "&:hover": { opacity: 1 } }}><MoreHorizontal size={12} color="#9ca3baf" /></IconButton>
                          </Box>

                          <Box sx={{ color: "#6b7280", fontSize: "12px", mb: 2, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", textAlign: "left", width: "100%", "& *": { fontFamily: "inherit !important", fontSize: "12px !important", color: "#6b7280 !important" }, "& p": { margin: "0 !important", lineHeight: "1.4 !important" }, "& strong, & b": { fontWeight: "600 !important" }, "& em, & i": { fontStyle: "italic !important" } }}
                            dangerouslySetInnerHTML={{
                              __html: (() => {
                                if (!task.description) return "";
                                if (task.description.includes("<") && task.description.includes(">")) return task.description;
                                return task.description.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
                              })()
                            }} />

                          <Box sx={{ mb: 2, width: "100%", display: "flex", justifyContent: "flex-start" }}>
                            <StatusChip label={task.status.replace("-", " ")} status={task.status} size="small" sx={{ textAlign: "left" }} />
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Calendar size={12} color="#6b7280" />
                              <Typography variant="caption" sx={{ color: "#6b7280" }}>{formatDate(task.dueDate)}</Typography>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {Array.isArray(task.assignedTo) && task.assignedTo.length > 0 && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: -0.5 }}>
                                  {task.assignedTo.slice(0, 3).map((user, idx) => (
                                    <Avatar key={user._id} sx={{ width: 24, height: 24, fontSize: "10px", fontWeight: 600, backgroundColor: "var(--purpleShadeBg)", zIndex: 3 - idx, ml: idx !== 0 ? -1 : 0, border: "2px solid #fff", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }} title={user.name}>
                                      {!user.profilePhoto && getInitials(user.name)}
                                    </Avatar>
                                  ))}
                                  {task.assignedTo.length > 3 && (
                                    <Avatar sx={{ width: 24, height: 24, fontSize: "10px", fontWeight: 600, backgroundColor: "#e5e7eb", color: "#374151", ml: -1, border: "2px solid #fff" }} title={`+${task.assignedTo.length - 3} more`}>
                                      +{task.assignedTo.length - 3}
                                    </Avatar>
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </TaskCard>
                    ))}
                  </Box>
                </ColumnContainer>
              );
            })}
          </Box>
        )}
      </BoardContainer>

      {/* Add Task Modal */}
      <Dialog
        open={addTaskModalOpen}
        onClose={handleAddTaskModalClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 3,
            minWidth: "800px",
            minHeight: "600px",
            // maxHeight: "90vh",
            border: "1px solid #e0e0e0",
            // overflow: "hidden"
          }
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <MdAddTask size={20} color="var(--textColor)" />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--textColor)" }}>Create Task</Typography>
          </Box>
          <Button onClick={handleAddTaskModalClose} sx={{ minWidth: 0, p: 1, color: "#888", fontSize: "18px" }}>✕</Button>
        </Box>
        <Box className="modal-scrollable-content" sx={{ height: "calc(100% - 56px)" }}>
          <TaskForm onSuccess={() => handleAddTaskModalClose()} />
        </Box>
      </Dialog>

      {/* Task Details Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <ModalContainer>
          <ModalHeader
            title="Task Details"
            onClose={handleCloseModal}
            showToggle
            modalView={modalView}
            setModalView={setModalView}
          />
          {isTaskLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress size={40} /></Box>
          ) : taskDetails?.data ? (
            <Box sx={{ p: 3 }}>
              {modalView === "details" ? (
                <Grid container spacing={3}>
                  {/* Left Panel */}
                  <Grid item xs={12} md={7}>
                    <Box sx={{ maxHeight: "calc(90vh - 160px)", height: "calc(90vh - 160px)", overflowY: "auto", pr: 1, scrollbarWidth: "none", msOverflowStyle: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                      {/* Task Title */}
                      {isEditingTitle ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                          <TextField fullWidth variant="standard" value={inlineTitle} onChange={e => setInlineTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && inlineTitle.trim()) handleInlineSave("title"); if (e.key === "Escape") setIsEditingTitle(false); }} disabled={inlineEditLoading} sx={{ "& .MuiInput-root": { fontSize: "1.5rem", fontWeight: 700, color: "#111827" } }} autoFocus />
                          <IconButton size="small" onClick={() => !inlineEditLoading && inlineTitle.trim() && handleInlineSave("title")} disabled={inlineEditLoading || !inlineTitle.trim()} sx={{ color: "#10b981" }}><Check size={18} /></IconButton>
                          <IconButton size="small" onClick={() => { setIsEditingTitle(false); setInlineTitle(taskDetails.data.title); }} disabled={inlineEditLoading} sx={{ color: "#ef4444" }}><X size={18} /></IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", flex: 1, cursor: "pointer", transition: "color 0.2s", "&:hover": { color: "var(--purpleShadeBg)" } }} onClick={() => setIsEditingTitle(true)} title="Click to edit title">{taskDetails.data.title}</Typography>
                          <IconButton size="small" onClick={() => setIsEditingTitle(true)} sx={{ opacity: 0.7, transition: "color 0.2s", "&:hover": { opacity: 1, color: "var(--purpleShadeBg)" } }}><Edit3 size={16} /></IconButton>
                        </Box>
                      )}

                      {/* Description */}
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Description</Typography>
                        <Box sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: 2, border: "1px solid #e5e7eb", minHeight: 100, "& *": { fontFamily: "inherit !important" }, "& p": { margin: "0 !important", marginBottom: "8px !important", "&:last-child": { marginBottom: "0 !important" } } }}
                          dangerouslySetInnerHTML={{
                            __html: (() => {
                              if (!taskDetails.data.description) return '<p style="color: #9ca3baf; font-style: italic;">No description provided</p>';
                              if (taskDetails.data.description.includes("<") && taskDetails.data.description.includes(">")) return taskDetails.data.description;
                              return taskDetails.data.description.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
                            })()
                          }} />
                      </Box>

                      {/* Add Comment */}
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Add Comment</Typography>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Avatar src={user?.profilePhoto} sx={{ backgroundColor: user?.profilePhoto ? "transparent" : "var(--purpleShadeBg)" }}>
                            {!user?.profilePhoto && getInitials(user?.name || "You")}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <TextField fullWidth multiline rows={3} placeholder="Write a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} variant="outlined" sx={{ fontSize: "14px", borderRadius: "12px", background: "#fafafa", "& .MuiOutlinedInput-root": { borderRadius: "12px", background: "#fafafa", fontSize: "14px", padding: 0, "& fieldset": { borderColor: "var(--textFieldBorderColor, #ced4da)", borderRadius: "12px" }, "&:hover fieldset": { borderColor: "var(--textFieldBorderColor, #ced4da)" }, "&.Mui-focused fieldset": { borderColor: "var(--textFieldFocusBorderColor, #343a40)", borderWidth: 1 } }, "& .MuiInputBase-input": { padding: "12px", fontSize: "14px", background: "#fafafa", borderRadius: "12px" } }} />
                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                              <Button variant="contained" onClick={handleAddComment} disabled={!newComment.trim()} startIcon={<Send size={16} />} sx={{ backgroundColor: "var(--purpleShadeBg)", textTransform: "none", fontWeight: 600, "&:hover": { backgroundColor: "var(--purpleShadeBg)", opacity: 0.9 } }}>Send</Button>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* Comments Section */}
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                          <MessageCircle size={20} />
                          Comments ({taskDetails.data.comments?.length || 0})
                        </Typography>
                        <Box sx={{ height: 300, overflowY: "auto", pr: 0.5, display: "flex", flexDirection: "column", gap: 1.2 }}>
                          {taskDetails.data.comments && taskDetails.data.comments.length > 0 ? (
                            [...taskDetails.data.comments].reverse().map(comment => <CommentItem key={comment._id} comment={comment} depth={0} />)
                          ) : (
                            <Box sx={{ textAlign: "center", py: 4 }}>
                              <Typography variant="body2" sx={{ color: "#9ca3baf" }}>No comments yet. Be the first to add one!</Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Right Panel */}
                  <Grid item xs={12} md={5}>
                    <Box sx={{ maxHeight: "calc(90vh - 160px)", overflowY: "auto", pr: 1, scrollbarWidth: "none", msOverflowStyle: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                      {/* Total Time Spent */}
                      <Box sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#6b7280", mb: 0.5, letterSpacing: 0.2 }}>Total Time Spent</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.2, backgroundColor: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", minHeight: 38, fontSize: "13px" }}>
                          <Clock size={15} style={{ color: "#10b981" }} />
                          <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#111827" }}>{taskDetails.data.totalTimeSpentFormatted || "--"}</Typography>
                        </Box>
                      </Box>

                      <Stack spacing={3} sx={{ marginTop: 2 }}>
                        {/* Status */}
                        <Box sx={{ mb: 1.5 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#6b7280", mb: 0.5, letterSpacing: 0.2 }}>Status</Typography>
                          <FormControl fullWidth size="small">
                            <Select value={taskStatus} onChange={e => handleStatusChange(e.target.value)} sx={{ fontSize: "14px", borderRadius: "12px", background: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--textFieldBorderColor, #ced4da)", borderRadius: "12px" } }}>
                              <MenuItem value="pending"><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Circle size={16} style={{ color: "#f59e0b" }} />Pending</Box></MenuItem>
                              <MenuItem value="in-progress"><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Play size={16} style={{ color: "#3b82f6" }} />In Progress</Box></MenuItem>
                              <MenuItem value="completed"><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><CheckCircle size={16} style={{ color: "#10b981" }} />Completed</Box></MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        {/* Priority */}
                        <Box sx={{ mb: 1.5 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#6b7280", mb: 0.5, letterSpacing: 0.2 }}>Priority</Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.2, backgroundColor: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", minHeight: 38, fontSize: "13px" }}>
                            <Flag size={15} style={{ color: taskDetails.data.priority === "high" ? "#ef4444" : taskDetails.data.priority === "medium" ? "#f59e0b" : "#10b981" }} />
                            <Typography sx={{ textTransform: "capitalize", fontWeight: 500, fontSize: "13px" }}>{taskDetails.data.priority}</Typography>
                          </Box>
                        </Box>

                        {/* Due Date */}
                        <Box sx={{ mb: 1.5 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#6b7280", mb: 0.5, letterSpacing: 0.2 }}>Due Date</Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.2, backgroundColor: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", minHeight: 38, fontSize: "13px" }}>
                            <Calendar size={15} style={{ color: "#6b7280" }} />
                            <Typography sx={{ fontWeight: 500, fontSize: "13px" }}>{formatDMY(taskDetails.data.dueDate)}</Typography>
                          </Box>
                        </Box>

                        {/* Assigned By */}
                        <Box sx={{ mb: 1.5 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#6b7280", mb: 0.5, letterSpacing: 0.2 }}>Assigned By</Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.2, backgroundColor: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", minHeight: 38, fontSize: "13px" }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: "11px", backgroundColor: "var(--purpleShadeBg)" }}>{getInitials(taskDetails.data.assignedBy)}</Avatar>
                            <Typography sx={{ fontWeight: 500, fontSize: "13px" }}>{taskDetails.data.assignedBy}</Typography>
                          </Box>
                        </Box>

                        {/* Assigned To */}
                        <Box sx={{ mb: 1.5 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#6b7280", mb: 0.5, letterSpacing: 0.2 }}>Assigned To</Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.2, backgroundColor: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", minHeight: 38, fontSize: "13px" }}>
                            {taskDetails.data.assignedTo?.map(member => (
                              <Avatar key={member._id} src={member.profilePhoto} sx={{ width: 24, height: 24, fontSize: "11px", backgroundColor: member.profilePhoto ? "transparent" : "var(--purpleShadeBg)", color: "#fff" }}>
                                {!member.profilePhoto && getInitials(member.name)}
                              </Avatar>
                            ))}
                            <Typography sx={{ fontWeight: 500, fontSize: "13px" }}>{taskDetails.data.assignedTo?.map(member => member.name).join(", ")}</Typography>
                          </Box>
                        </Box>

                        {/* Start/End Time */}
                        <Stack spacing={2}>
                          {!localStart && !taskDetails?.data?.currentStartTimeFormatted && (
                            <button type="button" style={{ backgroundColor: "var(--successBgColor, #daf5e6)", color: "var(--successTextColor, #28c76f)", textTransform: "none", fontWeight: 600, fontSize: "1rem", borderRadius: "8px", padding: "0 16px", minWidth: 0, boxShadow: "none", width: "100%", justifyContent: "center", height: "38px", minHeight: "38px", border: "none", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", transition: "opacity 0.2s" }}
                              onClick={async () => {
                                try {
                                  const res = await startTaskTime({ taskId: selectedTaskId }).unwrap();
                                  setSnackbarMsg(res?.message || "Start time set.");
                                  setSnackbarSeverity("success");
                                  setSnackbarOpen(true);
                                  setLocalStart(res.data.startTime);
                                  setLocalEnd(null);
                                } catch (err) {
                                  setSnackbarMsg(err?.data?.message || "Failed to set start time.");
                                  setSnackbarSeverity("error");
                                  setSnackbarOpen(true);
                                }
                              }}>
                              <Play size={18} />Start Task
                            </button>
                          )}

                          {taskDetails?.data?.currentStartTimeFormatted && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.2, backgroundColor: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", minHeight: 38, fontSize: "13px" }}>
                              <Play size={15} style={{ color: "#3b82f6" }} />
                              <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#111827", minWidth: 90 }}>Start Time:</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {formatDMYWithTime(taskDetails.data.currentStartTimeFormatted)}
                              </Typography>
                            </Box>
                          )}

                          {taskDetails?.data?.currentStartTimeFormatted && !localEnd && (
                            <button
                              type="button"
                              style={{
                                backgroundColor: "var(--redShadeBg, #ffe3e4)",
                                color: "var(--redShadeColor, #ff4d52)",
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "1rem",
                                borderRadius: "8px",
                                padding: "0 16px",
                                minWidth: 0,
                                boxShadow: "none",
                                width: "100%",
                                justifyContent: "center",
                                height: "38px",
                                minHeight: "38px",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                transition: "opacity 0.2s",
                              }}
                              onClick={async () => {
                                try {
                                  const res = await endTaskTime({ taskId: selectedTaskId }).unwrap();
                                  setSnackbarMsg(res?.message || "End time set.");
                                  setSnackbarSeverity("success");
                                  setSnackbarOpen(true);
                                  setLocalEnd(res.data.endTime);
                                } catch (err) {
                                  setSnackbarMsg(err?.data?.message || "Failed to set end time.");
                                  setSnackbarSeverity("error");
                                  setSnackbarOpen(true);
                                }
                              }}
                            >
                              <CheckCircle size={18} />
                              End Task
                            </button>
                          )}

                          {taskDetails?.data?.lastEndTime && !taskDetails?.data?.currentStartTimeFormatted && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                p: 1.2,
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                                minHeight: 38,
                                fontSize: "13px",
                              }}
                            >
                              <CheckCircle size={15} style={{ color: "#10b981" }} />
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "13px",
                                  color: "#111827",
                                  minWidth: 90,
                                }}
                              >
                                End Time:
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {formatDMYWithTime(taskDetails.data.lastEndTime)}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                        {taskDetails?.data?.updatedBy?.name && (
                          <Typography sx={{ fontWeight: 500, fontSize: "13px", color: "#6b7280", textAlign: "right", mb: 1 }}>
                            Last Updated By: <Typography component="span" sx={{ fontWeight: 600, fontSize: "13px", color: "#111827", textTransform: "lowercase" }}>{taskDetails.data.updatedBy.name}</Typography>
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ height: "calc(90vh - 160px)", overflowY: "auto" }}>
                  {taskDetails?.data?.timeLogs && taskDetails.data.timeLogs.length > 0 ? (
                    <TableContainer
                      component={Paper}
                      sx={{
                        borderRadius: 2,
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                        overflow: "hidden",
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            {["Log", "Start Time", "End Time", "Start Image", "End Image"].map((head) => (
                              <TableCell
                                key={head}
                                sx={{
                                  fontWeight: 600,
                                  fontSize: "0.9rem",
                                  backgroundColor: "var(--tableHeaderBackgroundColor)",
                                  color: "var(--textColor)",
                                  borderBottom: "none",
                                }}
                              >
                                {head}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {taskDetails.data.timeLogs.map((log, index) => (
                            <TableRow
                              key={log._id}
                              sx={{
                                "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                                "&:hover": { backgroundColor: "#f1f5f9" },
                              }}
                            >
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{log.start ? formatDMYWithTime(log.start) : "--"}</TableCell>
                              <TableCell>{log.end ? formatDMYWithTime(log.end) : "--"}</TableCell>
                              <TableCell>
                                {log.startImage ? (
                                  <img
                                    src={log.startImage}
                                    alt="Start"
                                    style={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: "8px",
                                      objectFit: "cover",
                                      border: "1px solid #eee",
                                    }}
                                  />
                                ) : (
                                  "--"
                                )}
                              </TableCell>
                              <TableCell>
                                {log.endImage ? (
                                  <img
                                    src={log.endImage}
                                    alt="End"
                                    style={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: "8px",
                                      objectFit: "cover",
                                      border: "1px solid #eee",
                                    }}
                                  />
                                ) : (
                                  "--"
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "400px",
                        color: "#9ca3af",
                      }}
                    >
                      <Clock size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
                      <Typography variant="h6" sx={{ color: "#6b7280", mb: 1 }}>
                        No Time Logs Available
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#9ca3baf" }}>
                        This task doesn't have any time logs yet.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Typography variant="body1" sx={{ color: "#6b7280" }}>
                No task details found.
              </Typography>
            </Box>
          )}
        </ModalContainer>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ViewUserTask;