import React from "react";
import { Box, Card, Typography, Chip, Paper, IconButton, Avatar, Modal, Button, Grid, CircularProgress, Snackbar, Alert, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, FormControl, Select, MenuItem, TextField, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ClipboardList, MoreHorizontal, Calendar, X, Edit3, Check, Flag, Play, CheckCircle, MessageCircle, Circle, Plus, Pencil, Clock, Send } from "lucide-react";
import { useGetTasksQuery, useUpdateTaskStatusMutation, useGetTaskByIdQuery, useAddTaskCommentMutation, useUpdateTaskMutation, useDeleteTaskMutation } from "../../API/taskApi";
import { useEmployee } from "../../utils/EmployeeContext";
import { CustomLoader, LoaderContainer } from "../Layout/CustomLoader";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import { MdAddTask } from "react-icons/md";

const Container = styled(Box)({ minHeight: "100vh", backgroundColor: "#f8fafc" });
const Header = styled(Box)({ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", position: "sticky", top: 0, zIndex: 50 });
const BoardContainer = styled(Box)(({ theme }) => ({ padding: "24px", height: "calc(100vh - 265px)", overflowX: "hidden", overflowY: "hidden", display: "flex", alignItems: "flex-start", "& > div": { display: "flex", gap: theme.spacing(2), width: "100%", justifyContent: "space-between" }, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none", msOverflowStyle: "none" }));
const ColumnContainer = styled(Paper)(({ isDragOver, theme }) => ({
  flex: "1 1 0",
  minWidth: 0,
  backgroundColor: isDragOver ? "#f0f9ff" : "#f1f5f9",
  borderRadius: "8px",
  border: isDragOver ? "2px solid #3b82f6" : "1px solid #e2e8f0",
  transition: "all 0.15s ease",
  display: "flex",
  flexDirection: "column",
  height: "calc(100vh - 310px)",
  maxHeight: "calc(100vh - 310px)",
  margin: 0,
  overflowY: "auto",
  overflowX: "hidden",
  "&::-webkit-scrollbar": {
    width: "8px"
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f1f5f9",
    borderRadius: "4px"
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#cbd5e1",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "#94a3b8"
    }
  },
  scrollbarWidth: "thin",
  msOverflowStyle: "auto"
}));
const TaskCard = styled(Card)(({ isDragging }) => ({ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", marginBottom: "8px", cursor: "grab", opacity: isDragging ? 0.5 : 1, transform: isDragging ? "rotate(2deg)" : "none", transition: "all 0.2s ease", width: "100%", "&:hover": { boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", backgroundColor: "#fafafa" } }));
const StatusChip = styled(Chip)(({ status }) => ({ fontSize: "10px", height: "20px", fontWeight: 500, textTransform: "uppercase", backgroundColor: status === "completed" ? "#dcfce7" : status === "in-progress" ? "#dbeafe" : "#f3f4f6", color: status === "completed" ? "#166534" : status === "in-progress" ? "#1e40af" : "#374151" }));
const StyledToggleButton = styled(ToggleButton)(({ theme, isActive }) => ({ backgroundColor: isActive ? "#6366f1" : "transparent", color: isActive ? "#ffffff" : "#6b7280", border: "1px solid #e5e7eb", borderRadius: "8px !important", textTransform: "none", fontWeight: 600, fontSize: "14px", padding: "8px 16px", minWidth: "100px", "&:hover": { backgroundColor: isActive ? "#5855eb" : "#f3f4f6", color: isActive ? "#ffffff" : "#374151" }, "&.Mui-selected": { backgroundColor: "#6366f1", color: "#ffffff", "&:hover": { backgroundColor: "#5855eb" } } }));

const statuses = [
  { key: "pending", label: "Pending", color: "#dfe1e6", icon: <Circle size={16} color="#f59e0b" /> },
  { key: "in-progress", label: "In Progress", color: "#0052cc", icon: <Play size={16} color="#2563eb" /> },
  { key: "completed", label: "Completed", color: "#36b37e", icon: <CheckCircle size={16} color="#10b981" /> }
];

const AdminTaskBoard = ({ tasks }) => {
  const { selectedEmployee } = useEmployee();
  const user = JSON.parse(localStorage.getItem("user"));
  const orgId = typeof user?.organization === "object" && user?.organization?._id ? user.organization._id : user?.organization;
  const { data, isLoading, isError, refetch } = useGetTasksQuery(orgId, { skip: !orgId || !!selectedEmployee });
  const { data: userTasksData, isLoading: userTasksLoading, isError: userTasksError, refetch: refetchUserTasks } = useEmployee() ? useGetTasksQuery(orgId, { skip: true }) : useGetTasksQuery(orgId, { skip: true });

  // Combined state declarations
  const [draggedTaskId, setDraggedTaskId] = React.useState(null);
  const [dragOverStatus, setDragOverStatus] = React.useState(null);
  const [selectedTaskId, setSelectedTaskId] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newComment, setNewComment] = React.useState("");
  const [taskStatus, setTaskStatus] = React.useState("");
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [inlineTitle, setInlineTitle] = React.useState("");
  const [inlineEditLoading, setInlineEditLoading] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState("success");
  const [isTaskFormOpen, setIsTaskFormOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedTaskData, setSelectedTaskData] = React.useState(null);
  const [taskFormStatus, setTaskFormStatus] = React.useState("pending");
  const [taskDetailsModalOpen, setTaskDetailsModalOpen] = React.useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [viewMode, setViewMode] = React.useState("board");
  const [modalView, setModalView] = React.useState("details");

  // Mutations and queries
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [addTaskComment] = useAddTaskCommentMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const { data: taskDetails, isLoading: isTaskLoading } = useGetTaskByIdQuery(selectedTaskId, { skip: !selectedTaskId });
  const { data: selectedTaskDetails, isLoading: isSelectedTaskLoading } = useGetTaskByIdQuery(selectedTaskForDetails, { skip: !selectedTaskForDetails });

  // Event handlers
  const onDragStart = (e, taskId) => { setDraggedTaskId(taskId); e.dataTransfer.effectAllowed = "move"; };
  const onDragEnd = () => setDraggedTaskId(null);
  const onDragOver = (e, statusKey) => { e.preventDefault(); setDragOverStatus(statusKey); };
  const onDragLeave = () => setDragOverStatus(null);
  const onDrop = async (e, statusKey) => { e.preventDefault(); setDragOverStatus(null); if (draggedTaskId) { try { await updateTaskStatus({ taskId: draggedTaskId, status: statusKey }).unwrap(); refetch(); } catch (err) { setSnackbarMsg("Failed to update task status!"); setSnackbarSeverity("error"); setSnackbarOpen(true); } setDraggedTaskId(null); } };
  const handleOpen = (taskId) => { setSelectedTaskId(taskId); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedTaskId(null); setNewComment(""); setTaskStatus(""); setIsEditingTitle(false); };
  const getInitials = (name) => name ? name.trim().charAt(0).toUpperCase() : "";
  const handleOpenTaskDetails = (taskId) => { setSelectedTaskForDetails(taskId); setTaskDetailsModalOpen(true); };
  const handleCloseTaskDetails = () => { setTaskDetailsModalOpen(false); setSelectedTaskForDetails(null); setNewComment(""); setModalView("details"); };
  const handleStatusChange = async (newStatus) => { try { const taskId = taskDetailsModalOpen ? selectedTaskForDetails : selectedTaskId; await updateTaskStatus({ taskId: taskId, status: newStatus }).unwrap(); setTaskStatus(newStatus); refetch(); setSnackbarMsg("Task status updated successfully."); setSnackbarSeverity("success"); setSnackbarOpen(true); } catch (err) { setSnackbarMsg("Failed to update task status."); setSnackbarSeverity("error"); setSnackbarOpen(true); } };
  const handleAddComment = async () => { if (newComment.trim()) { try { const taskId = taskDetailsModalOpen ? selectedTaskForDetails : selectedTaskId; await addTaskComment({ taskId: taskId, comment: newComment.trim() }).unwrap(); setNewComment(""); setSnackbarMsg("Comment added successfully."); setSnackbarSeverity("success"); setSnackbarOpen(true); refetch(); } catch (err) { setSnackbarMsg("Failed to add comment."); setSnackbarSeverity("error"); setSnackbarOpen(true); } } };
  const handleInlineSave = async () => { if (inlineEditLoading) return; setInlineEditLoading(true); try { await updateTask({ taskId: selectedTaskId, title: inlineTitle.trim() }).unwrap(); setIsEditingTitle(false); setSnackbarMsg("Task updated successfully."); setSnackbarSeverity("success"); setSnackbarOpen(true); refetch(); } catch (err) { setSnackbarMsg("Failed to update task."); setSnackbarSeverity("error"); setSnackbarOpen(true); } finally { setInlineEditLoading(false); } };
  const handleViewModeChange = (event, newView) => { if (newView) setViewMode(newView); };

  // Date formatters
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const formatDMY = (dateStr) => { if (!dateStr) return "--"; const date = new Date(dateStr); return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`; };
  const formatDMYWithTime = (dateStr) => { if (!dateStr) return "--"; const date = new Date(dateStr); const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`; const formattedTime = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "UTC" }); return `${formattedDate} ${formattedTime}`; };

  // Effects
  React.useEffect(() => { if (isModalOpen && taskDetails?.data?.status) setTaskStatus(taskDetails.data.status); if (taskDetails?.data) setInlineTitle(taskDetails.data.title || ""); }, [isModalOpen, taskDetails]);

  // Filter tasks
  const filteredTasks = React.useMemo(() => { if (!searchTerm.trim()) return tasks; return tasks.filter((task) => task.title.toLowerCase().includes(searchTerm.toLowerCase()) || (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) || (Array.isArray(task.assignedTo) && task.assignedTo.some((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))) || task.status.toLowerCase().includes(searchTerm.toLowerCase()) || task.priority.toLowerCase().includes(searchTerm.toLowerCase())); }, [tasks, searchTerm]);

  if (isLoading) return <LoaderContainer><CustomLoader /></LoaderContainer>;

  const renderTaskCard = (task) => (
    <TaskCard key={task._id} isDragging={draggedTaskId === task._id} draggable onDragStart={(e) => onDragStart(e, task._id)} onDragEnd={onDragEnd} onClick={() => handleOpenTaskDetails(task._id)} sx={{ cursor: "pointer" }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: "#111827", lineHeight: 1.3, textAlign: "left", width: "100%" }}>{task.title}</Typography>
          <IconButton size="small" sx={{ opacity: 0, "&:hover": { opacity: 1 } }}><MoreHorizontal size={12} color="#9ca3baf" /></IconButton>
        </Box>
        <Box sx={{ color: "#6b7280", fontSize: "12px", mb: 2, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", textAlign: "left", width: "100%" }}>{task.description}</Box>
        <Box sx={{ mb: 2, width: "100%", display: "flex", justifyContent: "flex-start" }}><StatusChip label={task.status.replace("-", " ")} status={task.status} size="small" sx={{ textAlign: "left" }} /></Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Calendar size={12} color="#6b7280" /><Typography variant="caption" sx={{ color: "#6b7280" }}>{formatDate(task.dueDate)}</Typography></Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {Array.isArray(task.assignedTo) && task.assignedTo.length > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: -0.5 }}>
                  {task.assignedTo.slice(0, 3).map((user, idx) => (<Avatar key={user._id} sx={{ width: 29, height: 29, fontSize: "15px", fontWeight: 600, backgroundColor: "var(--purpleShadeBg)", zIndex: 0 , ml: idx !== 0 ? -1 : 0, border: "2px solid #fff", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }} title={user.name}>{getInitials(user.name)}</Avatar>))}
                  {task.assignedTo.length > 3 && (<Avatar sx={{ width: 29, height: 29, fontSize: "15px", fontWeight: 600, backgroundColor: "#e5e7eb", color: "#374151", ml: -1, border: "2px solid #fff" }} title={`+${task.assignedTo.length - 3} more`}>+{task.assignedTo.length - 3}</Avatar>)}
                </Box>
              )}
            </Box>
            <Button variant="contained" size="small" onClick={(e) => { e.stopPropagation(); setSelectedTaskId(task._id); setSelectedTaskData(task); setEditModalOpen(true); }} sx={{ backgroundColor: "#374151", color: "#fff", textTransform: "none", minWidth: 28, height: 28, padding: 0, borderRadius: "50%", "&:hover": { backgroundColor: "#4b5562" } }}><Pencil size={15} /></Button>
          </Box>
        </Box>
      </Box>
    </TaskCard>
  );

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
  const ModalHeader = ({ title, onClose, showToggle = false }) => (
      <Box sx={{ p: "12px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <ClipboardList size={20} color="var(--textColor)" />
      <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", fontSize: "1.5rem", letterSpacing: "-0.025em" }}>
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
      <IconButton onClick={onClose} size="small" sx={{ border: "none", width: 36, height: 36 }}>
        <X size={18} />
      </IconButton>
    </Box>
  </Box>
  );

  const DetailField = ({ label, icon, value }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#6b7280", mb: 0.5, letterSpacing: 0.2 }}>{label}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.2, backgroundColor: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", minHeight: 38, fontSize: "13px" }}>
        {icon}<Typography sx={{ fontWeight: 500, fontSize: "13px" }}>{value}</Typography>
      </Box>
    </Box>
  );

  return (
    <>
    {/* <Card sx={{ borderRadius: 2.5, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)", color: "var(--textColor)", mt: 3}}> */}
      {viewMode === "board" ? (
        <BoardContainer>
          {filteredTasks.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center !important", alignItems: "center", height: "60vh", color: "#9ca3af" }}>
              <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.9rem", maxWidth: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Box sx={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)", display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5, opacity: 0.8 }}><ClipboardList size={24} color="#757575" /></Box>
                No tasks available right now.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", width: "100%", gap: 2, "& > *": { flex: "1 1 0", minWidth: 0 }}}>
              {statuses.map((status) => {
                const statusTasks = filteredTasks.filter((task) => task.status === status.key);
                const isDragOver = dragOverStatus === status.key;
                return (
                  <ColumnContainer key={status.key} isDragOver={isDragOver} onDragOver={(e) => onDragOver(e, status.key)} onDragLeave={onDragLeave} onDrop={(e) => onDrop(e, status.key) }>
                    <Box sx={{ p: 2, pb: 1, position: "sticky", top: 0, backgroundColor: isDragOver ? "#f0f9ff" : "#f1f5f9", zIndex: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {status.icon}<Typography variant="caption" sx={{ fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>{status.label}</Typography>
                          <Chip label={statusTasks.length} size="small" sx={{ height: 20, fontSize: "11px", backgroundColor: "#d1d5db", color: "#374151", fontWeight: 500 }} />
                          <IconButton size="small" sx={{ ml: 0.5, p: "2px", backgroundColor: "#f3f4f6", color: "#6366f1", "&:hover": { backgroundColor: "#ede9fe", color: "#7c3aed" } }} onClick={() => { setIsTaskFormOpen(true); setTaskFormStatus(status.key); }} aria-label={`Add ${status.label} Task`}><Plus size={16} /></IconButton>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ p: 2, pt: 0, flex: 1, overflowY: "auto", overflowX: "hidden", "&::-webkit-scrollbar": { width: "6px" }, "&::-webkit-scrollbar-track": { backgroundColor: "#f1f5f9" }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#cbd5e1", borderRadius: "3px" } }}>
                      {statusTasks.map(renderTaskCard)}
                    </Box>
                  </ColumnContainer>
                );
              })}
            </Box>
          )}
        </BoardContainer>
      ) : (
        <TaskList />
      )}

      {/* Task Details Modal */}
      <Modal open={taskDetailsModalOpen} onClose={handleCloseTaskDetails}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "95%", maxWidth: 1200, backgroundColor: "#ffffff", borderRadius: "16px", boxShadow: "0 20px 40px -8px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.08)", padding: 0, outline: "none", maxHeight: "90vh", overflowY: "auto", border: "1px solid #e5e7eb" }}>
          <ModalHeader title="Task Details" onClose={handleCloseTaskDetails} showToggle />
          {isSelectedTaskLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress size={40} /></Box>
          ) : selectedTaskDetails?.data ? (
            <Box sx={{ p: 3 }}>
              {modalView === "details" ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={7}>
                    <Box sx={{ maxHeight: "calc(90vh - 160px)", height: "calc(90vh - 160px)", overflowY: "auto", pr: 1, scrollbarWidth: "none", msOverflowStyle: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}><Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", flex: 1 }}>{selectedTaskDetails.data.title}</Typography></Box>
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Description</Typography>
                        <Box sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: 2, border: "1px solid #e5e7eb", minHeight: 100, "& *": { fontFamily: "inherit !important" }, "& p": { margin: "0 !important", marginBottom: "8px !important", "&:last-child": { marginBottom: "0 !important" } } }} dangerouslySetInnerHTML={{ __html: (() => { if (!selectedTaskDetails.data.description) return '<p style="color: #9ca3baf; font-style: italic;">No description provided</p>'; if (selectedTaskDetails.data.description.includes("<") && selectedTaskDetails.data.description.includes(">")) return selectedTaskDetails.data.description; return selectedTaskDetails.data.description.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, "&"); })() }} />
                      </Box>
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Add Comment</Typography>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Avatar src={user?.profilePhoto} sx={{ backgroundColor: user?.profilePhoto ? "transparent" : "var(--purpleShadeBg)" }}>{!user?.profilePhoto && getInitials(user?.name || "You")}</Avatar>
                          <Box sx={{ flex: 1 }}>
                            <TextField fullWidth multiline rows={3} placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} variant="outlined" sx={{ fontSize: "14px", borderRadius: "12px", background: "#fafafa", "& .MuiOutlinedInput-root": { borderRadius: "12px", background: "#fafafa", fontSize: "14px", padding: 0, "& fieldset": { borderColor: "var(--textFieldBorderColor, #ced4da)", borderRadius: "12px" }, "&:hover fieldset": { borderColor: "var(--textFieldBorderColor, #ced4da)" }, "&.Mui-focused fieldset": { borderColor: "var(--textFieldFocusBorderColor, #343a40)", borderWidth: 1 } }, "& .MuiInputBase-input": { padding: "12px", fontSize: "14px", background: "#fafafa", borderRadius: "12px" } }} />
                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}><Button variant="contained" onClick={handleAddComment} disabled={!newComment.trim()} startIcon={<Send size={16} />} sx={{ backgroundColor: "var(--purpleShadeBg)", textTransform: "none", fontWeight: 600, "&:hover": { backgroundColor: "var(--purpleShadeBg)", opacity: 0.9 } }}>Send</Button></Box>
                          </Box>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}><MessageCircle size={20} />Comments ({selectedTaskDetails.data.comments?.length || 0})</Typography>
                        <Box sx={{ height: 300, overflowY: "auto", pr: 0.5, display: "flex", flexDirection: "column", gap: 1.2 }}>
                          {selectedTaskDetails.data.comments && selectedTaskDetails.data.comments.length > 0 ? (
                            [...selectedTaskDetails.data.comments].reverse().map((comment, index) => (
                              <Paper key={comment._id || index} sx={{ p: 1.2, border: "1px solid #e5e7eb", borderRadius: 2, minHeight: 36, display: "flex", alignItems: "flex-start", boxShadow: "none", transition: "none", "&:hover": { boxShadow: "none", borderColor: "#e5e7eb" }, flexShrink: 0, width: "100%" }}>
                                <Avatar src={comment.userId?.profilePhoto} sx={{ width: 28, height: 28, backgroundColor: comment.userId?.profilePhoto ? "transparent" : "var(--purpleShadeBg)", fontSize: "12px", fontWeight: 700, mr: 1.2, flexShrink: 0 }}>{!comment.userId?.profilePhoto && getInitials(comment.userId?.name || "Anonymous")}</Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.2, flexWrap: "wrap" }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.97rem", color: "#374151", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", maxWidth: "60%" }}>{comment.userId?.name || "Anonymous"}</Typography>
                                    <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.85rem", ml: 1, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</Typography>
                                  </Box>
                                  <Typography variant="body2" sx={{ color: "#374151", fontSize: "0.97rem", mt: 0, mb: 0, wordBreak: "break-word", whiteSpace: "pre-line" }}>{comment.comment}</Typography>
                                </Box>
                              </Paper>
                            ))
                          ) : (
                            <Box sx={{ textAlign: "center", py: 4 }}><Typography variant="body2" sx={{ color: "#9ca3baf" }}>No comments yet. Be the first to add one!</Typography></Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Box sx={{ maxHeight: "calc(90vh - 160px)", overflowY: "auto", pr: 1, scrollbarWidth: "none", msOverflowStyle: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                      <DetailField label="Total Time Spent" icon={<Clock size={15} style={{ color: "#10b981" }} />} value={selectedTaskDetails.data.totalTimeSpentFormatted || "--"} />
                      <Stack spacing={3} sx={{ marginTop: 2 }}>
                        <Box sx={{ mb: 1.5 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#6b7280", mb: 0.5, letterSpacing: 0.2 }}>Status</Typography>
                          <FormControl fullWidth size="small">
                            <Select value={selectedTaskDetails.data.status} onChange={(e) => handleStatusChange(e.target.value)} sx={{ fontSize: "14px", borderRadius: "12px", background: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--textFieldBorderColor, #ced4da)", borderRadius: "12px" } }}>
                              <MenuItem value="pending"><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Circle size={16} style={{ color: "#f59e0b" }} />Pending</Box></MenuItem>
                              <MenuItem value="in-progress"><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Play size={16} style={{ color: "#3b82f6" }} />In Progress</Box></MenuItem>
                              <MenuItem value="completed"><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><CheckCircle size={16} style={{ color: "#10b981" }} />Completed</Box></MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        <DetailField label="Priority" icon={<Flag size={15} style={{ color: selectedTaskDetails.data.priority === "high" ? "#ef4444" : selectedTaskDetails.data.priority === "medium" ? "#f59e0b" : "#10b981" }} />} value={selectedTaskDetails.data.priority} />
                        <DetailField label="Due Date" icon={<Calendar size={15} style={{ color: "#6b7280" }} />} value={formatDMY(selectedTaskDetails.data.dueDate)} />
                        <DetailField label="Assigned By" icon={<Avatar sx={{ width: 24, height: 24, fontSize: "11px", backgroundColor: "var(--purpleShadeBg)" }}>{getInitials(selectedTaskDetails.data.assignedBy)}</Avatar>} value={selectedTaskDetails.data.assignedBy} />
                        <Box sx={{ mb: 1.5 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#6b7280", mb: 0.5, letterSpacing: 0.2 }}>Assigned To</Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.2, backgroundColor: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", minHeight: 38, fontSize: "13px" }}>
                            {selectedTaskDetails.data.assignedTo?.map(member => (<Avatar key={member._id} src={member.profilePhoto} sx={{ width: 24, height: 24, fontSize: "11px", backgroundColor: member.profilePhoto ? "transparent" : "var(--purpleShadeBg)", color: "#fff" }}>{!member.profilePhoto && getInitials(member.name)}</Avatar>))}
                            <Typography sx={{ fontWeight: 500, fontSize: "13px" }}>{selectedTaskDetails.data.assignedTo?.map(member => member.name).join(", ")}</Typography>
                          </Box>
                        </Box>
                        {selectedTaskDetails?.data?.updatedBy?.name && (<Typography sx={{ fontWeight: 500, fontSize: "13px", color: "#6b7280", textAlign: "right", mb: 1 }}>Last Updated By: <Typography component="span" sx={{ fontWeight: 600, fontSize: "13px", color: "#111827", textTransform: "lowercase" }}>{selectedTaskDetails.data.updatedBy.name}</Typography></Typography>)}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ height: "calc(90vh - 160px)", overflowY: "auto" }}>
                  {selectedTaskDetails?.data?.timeLogs && selectedTaskDetails.data.timeLogs.length > 0 ? (
                    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)", overflow: "hidden" }}>
                      <Table>
                        <TableHead>
                          <TableRow>{["Log", "Start Time", "End Time", "Start Latitude", "Start Longitude", "End Latitude", "End Longitude", "Start Image", "End Image"].map((head) => (<TableCell key={head} sx={{ fontWeight: 600, fontSize: "0.9rem", backgroundColor: "var(--tableHeaderBackgroundColor)", color: "var(--textColor)", borderBottom: "none" }}>{head}</TableCell>))}</TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedTaskDetails.data.timeLogs.map((log, index) => (
                            <TableRow key={log._id} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fafafa" }, "&:hover": { backgroundColor: "#f1f5f9" } }}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{log.start ? formatDMYWithTime(log.start) : "--"}</TableCell>
                              <TableCell>{log.end ? formatDMYWithTime(log.end) : "--"}</TableCell>
                              <TableCell>{log.startLatitude || "--"}</TableCell>
                              <TableCell>{log.startLongitude || "--"}</TableCell>
                              <TableCell>{log.endLatitude || "--"}</TableCell>
                              <TableCell>{log.endLongitude || "--"}</TableCell>
                              <TableCell>{log.startImage ? (<img src={log.startImage} alt="Start" style={{ width: 36, height: 36, borderRadius: "8px", objectFit: "cover", border: "1px solid #eee", cursor: "pointer" }} onClick={() => window.open(log.startImage, '_blank')} />) : ("--")}</TableCell>
                              <TableCell>{log.endImage ? (<img src={log.endImage} alt="End" style={{ width: 36, height: 36, borderRadius: "8px", objectFit: "cover", border: "1px solid #eee", cursor: "pointer" }} onClick={() => window.open(log.endImage, '_blank')} />) : ("--")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "400px", color: "#9ca3baf" }}>
                      <Clock size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
                      <Typography variant="h6" sx={{ color: "#6b7280", mb: 1 }}>No Time Logs Available</Typography>
                      <Typography variant="body2" sx={{ color: "#9ca3baf" }}>This task doesn't have any time logs yet.</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 6, textAlign: "center" }}><Typography variant="body1" sx={{ color: "#6b7280" }}>No task details found.</Typography></Box>
          )}
        </Box>
      </Modal>

      {/* Edit Modal */}
      {editModalOpen && selectedTaskData && (
        <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1300, padding: 2 }} onClick={(e) => { if (e.target === e.currentTarget) { setEditModalOpen(false); setSelectedTaskData(null); } }}>
          <Paper elevation={24} sx={{ backgroundColor: "white", width: "100%", maxWidth: "1100px", maxHeight: "90vh", overflowY: "auto", p: 4, borderRadius: 3, position: "relative", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)" }} onClick={(e) => e.stopPropagation()}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Pencil size={20} color="var(--textColor)" /><Typography variant="h6" sx={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>Edit Task</Typography></Box>
              <IconButton onClick={() => { setEditModalOpen(false); setSelectedTaskData(null); }} sx={{ color: "#6b7280", fontSize: "20px", p: 0.5, width: 32, height: 32, "&:hover": { color: "#000", backgroundColor: "transparent" } }}><X size={22} /></IconButton>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 2, pt: 2, pb: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151', fontSize: '13px', mr: 1 }}>Total Time</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563eb', fontSize: '13px' }}>{selectedTaskData.totalTimeSpentFormatted || "--"}</Typography>
            </Box>
            <TaskForm taskData={selectedTaskData} isEdit={true} onSuccess={() => { setEditModalOpen(false); setSelectedTaskData(null); refetch(); }} />
          </Paper>
        </Box>
      )}

      {/* Add Task Modal */}
      {isTaskFormOpen && (
        <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1300, padding: 2 }} onClick={(e) => { if (e.target === e.currentTarget) setIsTaskFormOpen(false); }}>
          <Paper elevation={24} sx={{ borderRadius: 4, p: 3, minWidth: "800px", minHeight: "600px", maxHeight: "90vh", maxWidth: "1200px", width: "100%", border: "1px solid #e0e0e0", overflow: "hidden", backgroundColor: "white", position: "relative", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)" }} onClick={(e) => e.stopPropagation()}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><MdAddTask size={24} color="var(--textColor)" /><Typography variant="h6" sx={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>Create Task</Typography></Box>
              <IconButton onClick={() => setIsTaskFormOpen(false)} sx={{ color: "#6b7280", fontSize: "20px", p: 0.5, width: 32, height: 32, "&:hover": { color: "#000", backgroundColor: "transparent" } }}><X size={22} /></IconButton>
            </Box>
            <TaskForm isEdit={false} defaultStatus={taskFormStatus} onSuccess={() => { setIsTaskFormOpen(false); refetch(); }} />
          </Paper>
        </Box>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>{snackbarMsg}</Alert>
      </Snackbar>
    {/* </Card> */}
    </>
  );
};

export default AdminTaskBoard;