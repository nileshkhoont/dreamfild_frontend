import React, { useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, Typography, Box, IconButton, Button, Grid, Menu, MenuItem, ListItemIcon, ListItemText, TextField, InputAdornment } from "@mui/material";
import { styled } from "@mui/material/styles";
import { X, ClipboardList, Pencil, Search } from "lucide-react";
import { MdAddTask } from "react-icons/md";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import TaskForm from "./TaskForm";
import AdminTaskBoard from "./AdminTaskBoard";
import "../../App.css";
import Tooltip from "@mui/material/Tooltip";
import { useGetTasksQuery, useGetTaskByIdQuery, useDeleteTaskMutation, useSpecificUserTasksQuery } from "../../API/taskApi";
import { CustomLoader, LoaderContainer } from "../Layout/CustomLoader";
import TableSortLabel from "@mui/material/TableSortLabel";
import { useEmployee } from "../../utils/EmployeeContext";
import DeleteDialogBox from "../DeleteDialogBox";
import { AiOutlineCalendar } from "react-icons/ai";

const Container = styled(Box)({ margin: "0 auto", paddingTop: "2rem" });
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({ borderRadius: 16, border: "none", "& .MuiTableCell-head": { backgroundColor: "var(--tableHeaderBackgroundColor)", fontWeight: 600, color: "var(--textColor)", borderBottom: "none" }, "& .MuiTableCell-root": { borderBottom: "none", borderRight: "none" }, "& .MuiTableRow-root:hover": { backgroundColor: "var(--hoverBackgroundColor)", transition: "background-color 0.3s ease" } }));

const TaskDetails = ({ taskId, onClose }) => {
  const { data, isLoading, isError } = useGetTaskByIdQuery(taskId, { skip: !taskId });
  if (!taskId) return null;
  if (isLoading) return <Box sx={{ p: 3 }}><Typography>Loading...</Typography></Box>;
  if (isError || !data?.data) return <Box sx={{ p: 3 }}><Typography color="error">Failed to load task details.</Typography></Box>;

  const task = data.data;
  const Field = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ color: "var(--textColor)", fontWeight: 500, fontSize: "15px", mb: 0.5, textAlign: "left", width: "100%" }}>{label}</Typography>
      <Box sx={{ "& .MuiInputBase-root": { backgroundColor: "white", borderRadius: 2, color: "var(--textColor)", minHeight: "40px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#d1d9e6" }, background: "white", border: "1px solid #d1d9e6", borderRadius: 2, px: 2, py: 1.5, fontSize: "15px", color: "var(--textColor)", minHeight: "40px", display: "flex", alignItems: "center", boxShadow: "none", outline: "none" }}>{value}</Box>
    </Box>
  );

  return (
    <Box sx={{ width: "100%", px: 0 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}><Field label="Title" value={task.title} /></Grid>
        <Grid item xs={12} md={6}><Field label="Due Date" value={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""} /></Grid>
        <Grid item xs={12}><Field label="Description" value={task.description} /></Grid>
        <Grid item xs={12} md={6}><Field label="Assigned To" value={Array.isArray(task.assignedTo) ? task.assignedTo.map((user) => user.name).join(", ") : ""} /></Grid>
        <Grid item xs={12} md={6}>
          <Field label="Status" value={
            <Box sx={{ px: 2, py: 0.5, borderRadius: 1, fontSize: "0.75rem", fontWeight: 500, backgroundColor: task.status === "completed" ? "rgba(76, 175, 80, 0.1)" : task.status === "in-progress" ? "rgba(33, 150, 243, 0.12)" : "rgba(244, 67, 54, 0.1)", color: task.status === "completed" ? "#4caf50" : task.status === "in-progress" ? "#1976d2" : "#f44336", textTransform: "capitalize", display: "inline-block" }}>
              {task.status.replace("-", " ")}
            </Box>
          } />
        </Grid>
        <Grid item xs={12} md={6}>
          <Field label="Priority" value={
            <Box sx={{ px: 2, py: 0.5, borderRadius: 1, fontSize: "0.75rem", fontWeight: 500, backgroundColor: task.priority === "urgent" ? "rgba(244, 67, 54, 0.1)" : task.priority === "high" ? "rgba(255, 152, 0, 0.18)" : task.priority === "medium" ? "rgba(33, 150, 243, 0.12)" : "rgba(76, 175, 80, 0.1)", color: task.priority === "urgent" ? "#f44336" : task.priority === "high" ? "#e65100" : task.priority === "medium" ? "#1976d2" : "#4caf50", textTransform: "capitalize", display: "inline-block" }}>
              {task.priority}
            </Box>
          } />
        </Grid>
      </Grid>
    </Box>
  );
};

const modalScrollbarStyles = `.modal-scrollable-content { height: 100%; overflow-y: auto; padding-right: 18px; box-sizing: content-box; border-radius: 0 24px 24px 0; background-clip: padding-box; } .modal-scrollable-content::-webkit-scrollbar { width: 12px; background: transparent; } .modal-scrollable-content::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #e0e0e0 60%, #bdbdbd 100%); border-radius: 24px; margin: 2px; border: 3px solid transparent; background-clip: padding-box; box-shadow: 0 0 0 6px #fff inset; } .modal-scrollable-content::-webkit-scrollbar-track { background: transparent; border-radius: 24px; } .modal-scrollable-content { scrollbar-width: thin; scrollbar-color: #bdbdbd #fff; }`;

const getMonthRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return [firstDay, lastDay];
};

const TaskList = () => {
  const { selectedEmployee } = useEmployee();
  const user = JSON.parse(localStorage.getItem("user"));
  const orgId = typeof user?.organization === "object" && user?.organization?._id ? user.organization._id : user?.organization;

  const { data, isLoading, isError, refetch } = useGetTasksQuery(orgId, { skip: !orgId || !!selectedEmployee });
  const { data: userTasksData, isLoading: userTasksLoading, isError: userTasksError, refetch: refetchUserTasks } = useSpecificUserTasksQuery(selectedEmployee, { skip: !selectedEmployee });

  React.useEffect(() => {
    if (selectedEmployee) refetchUserTasks();
    else if (orgId) refetch();
  }, [orgId, selectedEmployee, refetch, refetchUserTasks]);

  const tasks = selectedEmployee ? userTasksData?.data?.tasks || [] : data?.data?.tasks || [];

  const [open, setOpen] = React.useState(false);
  const [selectedTaskId, setSelectedTaskId] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: "", severity: "success" });
  const [addTaskModalOpen, setAddTaskModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedTaskData, setSelectedTaskData] = React.useState(null);
  const [deleteTask] = useDeleteTaskMutation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedMenuTask, setSelectedMenuTask] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("title");
  const [viewMode, setViewMode] = React.useState("table");
  const [dateRange, setDateRange] = React.useState([getMonthRange()[0], getMonthRange()[1]]);

  const descendingComparator = (a, b, orderBy) => { if (b[orderBy] < a[orderBy]) return -1; if (b[orderBy] > a[orderBy]) return 1; return 0; };
  const getComparator = (order, orderBy) => order === "desc" ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);

  const handleRequestSort = (event, property) => { const isAsc = orderBy === property && order === "asc"; setOrder(isAsc ? "desc" : "asc"); setOrderBy(property); };
  const handleOpen = (taskId) => { setSelectedTaskId(taskId); setOpen(true); };
  const handleClose = () => { setOpen(false); setSelectedTaskId(null); };
  const handleEditModalOpen = (task) => { setSelectedTaskData(task); setEditModalOpen(true); };
  const handleEditModalClose = () => { setEditModalOpen(false); setSelectedTaskData(null); refetch(); };
  const handleViewModeChange = (event, newView) => { if (newView) setViewMode(newView); };
  const truncateText = (text, maxLength) => { if (!text) return ""; if (text.length <= maxLength) return text; return `${text.substring(0, maxLength)}...`; };
  const handleDateRangeChange = (update) => setDateRange(update);

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteTask({ taskId: selectedTaskId, isDeleted: true }).unwrap();
      setSnackbar({ open: true, message: response.message || "Task deleted successfully.", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: error.data?.message || "Failed to delete task. Please try again.", severity: "error" });
    } finally {
      handleClose();
    }
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });
  const handleAddTaskModalOpen = () => setAddTaskModalOpen(true);
  const handleAddTaskModalClose = () => setAddTaskModalOpen(false);
  const handleMenuOpen = (event, task) => { setAnchorEl(event.currentTarget); setSelectedMenuTask(task); };
  const handleMenuClose = () => { setAnchorEl(null); setSelectedMenuTask(null); };
  const handleMenuEdit = () => { handleEditModalOpen(selectedMenuTask); handleMenuClose(); };
  const handleMenuDelete = () => { handleOpen(selectedMenuTask._id); handleMenuClose(); };

  const filteredTasks = React.useMemo(() => {
    let result = tasks;
    if (searchTerm.trim()) {
      result = result.filter((task) => task.title.toLowerCase().includes(searchTerm.toLowerCase()) || (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) || (Array.isArray(task.assignedTo) && task.assignedTo.some((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))) || task.status.toLowerCase().includes(searchTerm.toLowerCase()) || task.priority.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (dateRange[0] && dateRange[1]) {
      const start = new Date(dateRange[0]).setHours(0, 0, 0, 0);
      const end = new Date(dateRange[1]).setHours(23, 59, 59, 999);
      result = result.filter((task) => { const created = new Date(task.createdAt).getTime(); return created >= start && created <= end; });
    }
    return result;
  }, [tasks, searchTerm, dateRange]);
  // Add this styled component for the switch
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

  React.useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = modalScrollbarStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  React.useEffect(() => {
    if (selectedEmployee) refetchUserTasks();
    else if (orgId) refetch();
  }, [dateRange]);

  if (isLoading) return <LoaderContainer><CustomLoader /></LoaderContainer>;

  return (
    <Container sx={{ display: "flex", flexDirection: "column", justifyContent: "start", position: "relative" }}>

      {/* Main Card */}
      <Card
        sx={{
          minHeight: "calc(100vh - 204px)",
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          backgroundColor: "var(--cardBg, #fff)",
          px: 3,
          py: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              marginTop: "8px",
              justifyContent: "space-between",
              
            }}
          >

            <Box>
              <ClipboardList size={22} color="var(--textColor)" />
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
                Task List
              </Typography>
            </Box>
            {/* Toggle Button Group Positioned at the Top-Right */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",

              }}
            >
              <StyledToggleButtonGroup>
                <StyledToggleButton
                  isActive={viewMode === "table"}
                  onClick={() => setViewMode("table")}
                >
                  Table
                </StyledToggleButton>
                <StyledToggleButton
                  isActive={viewMode === "board"}
                  onClick={() => setViewMode("board")}
                >
                  Board
                </StyledToggleButton>
              </StyledToggleButtonGroup>


            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "nowrap", width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ minWidth: 200, maxWidth: 350, width: 250 }}>
                <TextField placeholder="Search by title" variant="outlined" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }}
                  sx={{ width: "100%", height: "40px", "& .MuiInputBase-root": { fontSize: "14px", borderRadius: "12px", height: "40px", pl: 1.5, pr: 1.5 }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--textFieldBorderColor, #ced4da)", borderRadius: "12px" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--textFieldBorderColor, #ced4da)" }, "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline": { borderColor: "var(--textFieldFocusBorderColor, #343a40)", borderWidth: 1 } }} />
              </Box>
              <Box sx={{ minWidth: 200, position: "relative" }}>
                <DatePicker selectsRange={true} startDate={dateRange[0]} endDate={dateRange[1]} onChange={handleDateRangeChange} isClearable={true} placeholderText="Select date range" dateFormat="dd/MM/yyyy" popperProps={{ strategy: "fixed", placement: "bottom-start" ,}}
                  customInput={
                    <TextField className="custom-textfield" size="small"
                      InputProps={{ startAdornment: <InputAdornment position="start"><AiOutlineCalendar size={18} color="#666" /></InputAdornment> }}
                      sx={{ width: { xs: "100%", sm: "250px" }, "& .MuiInputBase-root": { fontSize: "14px", borderRadius: "12px", height: "40px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--textFieldBorderColor, #ced4da)", borderRadius: "12px" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--textFieldBorderColor, #ced4da)" }, "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline": { borderColor: "var(--textFieldFocusBorderColor, #343a40)", borderWidth: 1 } }} />
                  }
                  calendarClassName="custom-datepicker-calendar"
                  dayClassName={(date) => {
                    const isSelected = dateRange[0] && dateRange[1] && date >= dateRange[0] && date <= dateRange[1];
                    return isSelected ? "custom-datepicker-selected" : "custom-datepicker-day";
                  }} />
              </Box>
            </Box>
            <Button variant="contained" color="primary" size="small" onClick={handleAddTaskModalOpen}
              sx={{
                backgroundColor: "white", color: "var(--purpleShadeBg)",
                borderColor: "var(--purpleShadeBg)", borderRadius: "5px", fontWeight: 600, fontSize: "16px", textTransform: "none", px: 2, py: 1, height: "40px", minWidth: "120px", boxShadow: "none", "&:hover": {   boxShadow: "none" }
              }}>
              + Add Task
            </Button>
          </Box>
        </Box>

        {viewMode === "board" ? (
          <AdminTaskBoard tasks={filteredTasks} />
        ) : (
          <CardContent sx={{ flexGrow: 1, pb: 3, px: 0, display: "flex", flexDirection: "column" }}>
            {/* Fixed Table Header */}
            <StyledTableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: "16px 16px 0 0", // Only top corners rounded
                marginBottom: 0,
              }}
            >
              <Table sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      width: "20%", 
                      py: 1.5, 
                      fontWeight: 600,
                      backgroundColor: "var(--tableHeaderBackgroundColor)",
                      borderBottom: "1px solid #e0e0e0"
                    }} sortDirection={orderBy === "title" ? order : false}>
                      <TableSortLabel active={orderBy === "title"} direction={orderBy === "title" ? order : "asc"} onClick={(e) => handleRequestSort(e, "title")}>Title</TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ 
                      width: "18%", 
                      py: 1.5, 
                      fontWeight: 600,
                      backgroundColor: "var(--tableHeaderBackgroundColor)",
                      borderBottom: "1px solid #e0e0e0"
                    }}>Assigned To</TableCell>
                    <TableCell sx={{ 
                      width: "15%", 
                      py: 1.5, 
                      fontWeight: 600,
                      backgroundColor: "var(--tableHeaderBackgroundColor)",
                      borderBottom: "1px solid #e0e0e0"
                    }} sortDirection={orderBy === "status" ? order : false}>
                      <TableSortLabel active={orderBy === "status"} direction={orderBy === "status" ? order : "asc"} onClick={(e) => handleRequestSort(e, "status")}>Status</TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ 
                      width: "15%", 
                      py: 1.5, 
                      fontWeight: 600,
                      backgroundColor: "var(--tableHeaderBackgroundColor)",
                      borderBottom: "1px solid #e0e0e0"
                    }} sortDirection={orderBy === "priority" ? order : false}>
                      <TableSortLabel active={orderBy === "priority"} direction={orderBy === "priority" ? order : "asc"} onClick={(e) => handleRequestSort(e, "priority")}>Priority</TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ 
                      width: "17%", 
                      py: 1.5, 
                      fontWeight: 600,
                      backgroundColor: "var(--tableHeaderBackgroundColor)",
                      borderBottom: "1px solid #e0e0e0"
                    }} sortDirection={orderBy === "dueDate" ? order : false}>
                      <TableSortLabel active={orderBy === "dueDate"} direction={orderBy === "dueDate" ? order : "asc"} onClick={(e) => handleRequestSort(e, "dueDate")}>Due Date</TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ 
                      width: "15%", 
                      py: 1.5, 
                      fontWeight: 600,
                      backgroundColor: "var(--tableHeaderBackgroundColor)",
                      borderBottom: "1px solid #e0e0e0"
                    }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
              </Table>
            </StyledTableContainer>

            {/* Scrollable Table Body */}
            <StyledTableContainer
              component={Paper}
              elevation={0}
              sx={{ 
                height: "calc(100vh - 350px)", // Adjust height to account for header
                maxHeight: "calc(100vh - 350px)",
                overflowY: "auto", // Enable vertical scrolling
                overflowX: "hidden", // Hide horizontal scroll
                flexGrow: 1,
                borderRadius: "0 0 16px 16px", // Only bottom corners rounded
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "rgba(0,0,0,0.1)",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "10px",
                  "&:hover": {
                    background: "rgba(0,0,0,0.5)",
                  },
                },
              }}
            >
              <Table sx={{ tableLayout: "fixed" }}>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                          <ClipboardList size={48} color="#bdbdbd" />
                          <Typography variant="h6" sx={{ color: "#888", fontWeight: 500 }}>No tasks found</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.slice().sort(getComparator(order, orderBy)).map((task) => (
                      <TableRow hover tabIndex={-1} key={task._id}>
                        <TableCell sx={{ py: 2, width: "20%" }}>
                          {task.title && task.title.length > 30 ? (
                            <Tooltip title={task.title} arrow placement="top"><span>{truncateText(task.title, 30)}</span></Tooltip>
                          ) : (task.title)}
                        </TableCell>
                        <TableCell sx={{ py: 2, width: "18%" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {Array.isArray(task.assignedTo) && task.assignedTo.length > 0 ? (
                              task.assignedTo.map((user) => (
                                <Typography key={user._id} variant="body2" sx={{ fontWeight: 500, color: "#333", mr: 1 }}>{user.name}</Typography>
                              ))
                            ) : (<Typography variant="body2" sx={{ color: "#888" }}>-</Typography>)}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2, width: "15%" }}>
                          <Box sx={{ px: 2, py: 0.5, borderRadius: 999, fontSize: "0.875rem", fontWeight: 500, backgroundColor: task.status === "completed" ? "rgba(76, 175, 80, 0.1)" : task.status === "in-progress" ? "rgba(33, 150, 243, 0.12)" : "rgba(244, 67, 54, 0.1)", color: task.status === "completed" ? "#4caf50" : task.status === "in-progress" ? "#1976d2" : "#f44336", textTransform: "capitalize", display: "inline-block" }}>
                            {task.status.replace("-", " ")}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2, width: "15%" }}>
                          <Box sx={{ px: 2, py: 0.5, borderRadius: 999, fontSize: "0.875rem", fontWeight: 500, backgroundColor: task.priority === "urgent" ? "rgba(244, 67, 54, 0.1)" : task.priority === "high" ? "rgba(255, 152, 0, 0.18)" : task.priority === "medium" ? "rgba(33, 150, 243, 0.12)" : "rgba(76, 175, 80, 0.1)", color: task.priority === "urgent" ? "#f44336" : task.priority === "high" ? "#e65100" : task.priority === "medium" ? "#1976d2" : "#4caf50", textTransform: "capitalize", display: "inline-block" }}>
                            {task.priority}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2, width: "17%" }}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""}
                        </TableCell>
                        <TableCell sx={{ py: 2, width: "15%" }}>
                          <IconButton aria-label="more actions" size="small" sx={{ color: "var(--textColor)" }} onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, task); }}>
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </CardContent>
        )}
      </Card>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { borderRadius: 2, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", minWidth: 140 } }} transformOrigin={{ horizontal: "right", vertical: "top" }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
        <MenuItem onClick={handleMenuEdit}>
          <ListItemIcon><EditIcon fontSize="small" sx={{ color: "#1976d2" }} /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuDelete}>
          <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: "var(--redShadeColor)" }} /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <DeleteDialogBox deleteDialogOpen={open} handleCancelDelete={handleClose} handleConfirmDelete={handleConfirmDelete} isDeleting={false}
        name={(() => {
          const task = tasks.find((t) => t._id === selectedTaskId);
          if (!task) return "";
          const maxLength = 40;
          return task.title && task.title.length > maxLength ? `${task.title.substring(0, maxLength)}...` : task.title;
        })()} />

      <Dialog open={addTaskModalOpen} onClose={handleAddTaskModalClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 3, minWidth: "800px", minHeight: "600px", maxHeight: "90vh", border: "1px solid #e0e0e0", overflow: "hidden" } }}>
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

      {editModalOpen && selectedTaskData && (
        <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1300, padding: 2 }} onClick={(e) => { if (e.target === e.currentTarget) handleEditModalClose(); }}>
          <Paper elevation={24} sx={{ backgroundColor: "white", width: "100%", maxWidth: "1100px", maxHeight: "90vh", overflowY: "auto", p: 4, borderRadius: 3, position: "relative", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)", "&::-webkit-scrollbar": { width: "12px" }, "&::-webkit-scrollbar-track": { background: "transparent", borderRadius: "12px" }, "&::-webkit-scrollbar-thumb": { background: "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)", borderRadius: "12px", border: "3px solid transparent", backgroundClip: "padding-box", "&:hover": { background: "linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)" } }, "&::-webkit-scrollbar-corner": { background: "transparent" }, scrollbarWidth: "thin", scrollbarColor: "#bdbdbd transparent" }} onClick={(e) => e.stopPropagation()}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Pencil size={20} color="var(--textColor)" />
                <Typography variant="h6" sx={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>Edit Task</Typography>
              </Box>
              <IconButton onClick={handleEditModalClose} sx={{ color: "#6b7280", fontSize: "20px", p: 0.5, width: 32, height: 32, "&:hover": { color: "#000", backgroundColor: "transparent" } }}>
                <X size={22} />
              </IconButton>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", px: 2, pt: 2, pb: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: "#374151", fontSize: "13px", mr: 1 }}>Total Time</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#2563eb", fontSize: "13px" }}>{selectedTaskData.totalTimeSpentFormatted || "--"}</Typography>
            </Box>
            <TaskForm taskData={selectedTaskData} isEdit={true} onSuccess={() => handleEditModalClose()} />
          </Paper>
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};



export default TaskList;