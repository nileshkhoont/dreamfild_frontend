import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import 'react-quill/dist/quill.snow.css';
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Typography,
    Paper,
    Grid,
    Container,
    Snackbar,
    Alert,
    Autocomplete,
    Chip,
    Avatar,
    FormControl,
    Select,
} from '@mui/material';
import { LoaderCircle } from 'lucide-react';
import dayjs from 'dayjs';
import "../../App.css"
import { useGetUsersQuery } from '../../apiService';
import { useCreateTaskMutation, useUpdateTaskMutation, useAddTaskCommentMutation, useGetTaskByIdQuery, useReplyToTaskCommentMutation } from '../../API/taskApi';

const TaskForm = ({ onSuccess, taskData = null, isEdit = false, defaultStatus = "pending" }) => {
    const [formData, setFormData] = useState({
        title: taskData?.title || '',
        description: taskData?.description || '',
        assignedTo: isEdit && Array.isArray(taskData?.assignedTo)
            ? taskData.assignedTo.map(user => user._id)
            : [],
        status: taskData?.status || defaultStatus || 'pending', // Use defaultStatus here
        priority: taskData?.priority || 'medium',
        dueDate: taskData?.dueDate || '',
    });

    const [dateInputs, setDateInputs] = useState({
        dueDate: taskData?.dueDate ? dayjs(taskData.dueDate, 'YYYY-MM-DD').format('YYYY-MM-DD') : '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [formErrors, setFormErrors] = useState({});
    const [newComment, setNewComment] = useState('');
    const [replyOpen, setReplyOpen] = useState({});
    const [replyTexts, setReplyTexts] = useState({});

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
    ];

    const priorityOptions = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' },
    ];

    const { data: usersData } = useGetUsersQuery();
    const userOptions = usersData?.responseData?.data || [];

    // Get active users for assignment
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const isUserRole = loggedInUser?.role === "user";
    const activeUserOptions = isUserRole
        ? userOptions.filter(user => user._id === loggedInUser._id)
        : userOptions;

    // When role is user, set assignedTo to logged-in user by default (for create mode)
    React.useEffect(() => {
        if (!isEdit && isUserRole && loggedInUser?._id) {
            setFormData(prev => ({
                ...prev,
                assignedTo: [loggedInUser._id]
            }));
        }
        // eslint-disable-next-line
    }, [isUserRole, loggedInUser?._id, isEdit]);

    // Get selected users for Autocomplete display - this should work for both create and edit
    const getSelectedUsers = () => {
        return userOptions.filter(user => formData.assignedTo.includes(user._id));
    };

    const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
    const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
    const [addTaskComment] = useAddTaskCommentMutation();
    const [replyToTaskComment] = useReplyToTaskCommentMutation();

    // Get fresh task data when in edit mode
    const { data: freshTaskData } = useGetTaskByIdQuery(
        taskData?._id,
        {
            skip: !isEdit || !taskData?._id,
            refetchOnMountOrArgChange: true
        }
    );

    // Use fresh data if available, otherwise fall back to taskData
    const currentTaskData = freshTaskData?.data || taskData;

    // Utility function to get user initials
    const getInitials = (name) => {
        if (!name) return "";
        return name.trim().charAt(0).toUpperCase();
    };


    const getTotalTime = () => {
        const total = currentTaskData?.totalTime || '00:00:00';
        return total;
    };

    const handleChange = (e, value) => {
        // For Autocomplete (Assigned To) multi-select
        if (Array.isArray(value)) {
            // value is array of user objects
            const userIds = value.map((u) => u._id);
            setFormData((prev) => ({
                ...prev,
                assignedTo: userIds,
            }));
            console.log('Selected User IDs:', userIds);
            if (formErrors.assignedTo) {
                setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.assignedTo;
                    return newErrors;
                });
            }
            return;
        }

        // For other fields
        const { name, value: val } = e.target;
        if (name === 'dueDate') {
            setDateInputs((prev) => ({ ...prev, [name]: val }));
            setFormData((prev) => ({ ...prev, [name]: val }));
            if (formErrors[name]) {
                setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
            return;
        }
        setFormData((prev) => ({
            ...prev,
            [name]: val,
        }));
        if (formErrors[name]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleDescriptionChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            description: value,
        }));
        if (formErrors.description) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.description;
                return newErrors;
            });
        }
    };

    const handleAddComment = async () => {
        if (newComment.trim() && isEdit && taskData?._id) {
            try {
                const response = await addTaskComment({
                    taskId: taskData._id,
                    comment: newComment.trim()
                }).unwrap();
                setNewComment("");
                setSnackbar({
                    open: true,
                    message: response?.message || 'Comment added successfully!',
                    severity: 'success'
                });
                // Auto close snackbar after 1.5 seconds for successful comment
                setTimeout(() => {
                    setSnackbar(prev => ({ ...prev, open: false }));
                }, 1500);
                // The comment will automatically appear due to cache invalidation and refetch
            } catch (err) {
                console.error("Failed to add comment:", err);
                setSnackbar({
                    open: true,
                    message: err?.data?.message || 'Failed to add comment',
                    severity: 'error'
                });
            }
        }
    };

    const handleReplyClick = (commentId) => {
        setReplyOpen((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    const handleReplyChange = (commentId, value) => {
        setReplyTexts((prev) => ({ ...prev, [commentId]: value }));
    };

    const handleReplySubmit = async (commentId) => {
        const replyText = replyTexts[commentId];
        if (!replyText?.trim() || !isEdit || !taskData?._id) return;
        try {
            await replyToTaskComment({
                taskId: taskData._id,
                commentId,
                reply: replyText.trim(),
            }).unwrap();
            setSnackbar({
                open: true,
                message: 'Reply sent!',
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: err?.data?.message || 'Failed to send reply',
                severity: 'error'
            });
        }
        setReplyTexts((prev) => ({ ...prev, [commentId]: '' }));
        setReplyOpen((prev) => ({ ...prev, [commentId]: false }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted'); // Debug log

        // Frontend validation for required fields
        const errors = {};
        if (!formData.title) errors.title = 'Title is required';

        // Check if description has meaningful content (not just empty HTML tags)
        const descriptionText = formData.description.replace(/<[^>]*>/g, '').trim();
        if (!formData.description || !descriptionText) errors.description = 'Description is required';

        if (!formData.assignedTo || formData.assignedTo.length === 0) errors.assignedTo = 'Assigned To is required';
        if (!formData.status) errors.status = 'Status is required';
        if (!formData.priority) errors.priority = 'Priority is required';
        if (!formData.dueDate) errors.dueDate = 'Due Date is required';

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            console.log('Validation errors:', errors); // Debug log
            return;
        }

        // Prepare payload
        const payload = {
            ...formData,
            status: (formData.status || '').toLowerCase(),
            priority: (formData.priority || '').toLowerCase(),
        };

        // Add taskId for update
        if (isEdit && taskData?._id) {
            payload.taskId = taskData._id;
        }

        try {
            setIsLoading(true);
            console.log('Task Data:', payload); // Debug log

            let res;
            if (isEdit) {
                // Call update API
                res = await updateTask(payload).unwrap();
            } else {
                // Call create API
                res = await createTask(payload).unwrap();
            }

            setSnackbar({
                open: true,
                message: res?.message || (isEdit ? 'Task updated successfully!' : 'Task created successfully!'),
                severity: 'success'
            });

            setTimeout(() => {
                if (onSuccess) {
                    onSuccess();
                }
            }, 1200);

            // Reset form if creating new task
            if (!isEdit) {
                setFormData({
                    title: '',
                    description: '',
                    assignedTo: [],
                    status: 'pending',
                    priority: 'medium',
                    dueDate: '',
                });
                setDateInputs({
                    dueDate: '',
                });
            }
            setFormErrors({});
        } catch (err) {
            console.error('API Error:', err); // Debug log
            setSnackbar({
                open: true,
                message: err?.data?.message || (isEdit ? 'Failed to update task' : 'Failed to create task'),
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Recursive component to render a comment or reply and its children
    const CommentWithReplies = ({
        comment,
        replyOpen,
        replyTexts,
        handleReplyClick,
        handleReplyChange,
        handleReplySubmit,
        getInitials,
        level = 0 // for indentation
    }) => {
        // Styling and structure copied from ViewUserTask for comment rendering
        const inputRef = React.useRef(null);

        React.useEffect(() => {
            if (replyOpen[comment._id] && inputRef.current) {
                inputRef.current.focus();
            }
        }, [replyOpen[comment._id]]);

        // Indent replies more for each level, but main comments are less indented
        const baseIndent = 0;
        const replyIndent = 12; // px
        const marginLeft = baseIndent + (level > 0 ? replyIndent * level : 0);
        return (
            <Box sx={{ ml: `${marginLeft}px`, mt: level > 0 ? 0.5 : 0 }}>
                <Box sx={{
                    py: 0.7,
                    px: 0,
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    boxShadow: 'none',
                    gap: 1,
                    minHeight: 34,
                }}>
                    <Avatar
                        src={comment.userId?.profilePhoto ? comment.userId.profilePhoto : undefined}
                        sx={{
                            width: 26,
                            height: 26,
                            backgroundColor: comment.userId?.profilePhoto ? "transparent" : "var(--purpleShadeBg)",
                            fontSize: '12px',
                            fontWeight: 600,
                            flexShrink: 0,
                        }}
                    >
                        {!comment.userId?.profilePhoto && getInitials(comment.userId?.name || 'A')}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#222', fontSize: '12.5px', letterSpacing: 0.1 }}>
                                {comment.userId?.name || 'Anonymous'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#bdbdbd', fontSize: '10px', fontWeight: 400 }}>
                                • {dayjs(comment.createdAt).format('MMM D, YYYY')}
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ textAlign: 'left', color: '#374151', fontSize: '12px', lineHeight: 1.45, wordBreak: 'break-word', mb: 0.3 }}>
                            {comment.comment}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                            <Button
                                size="small"
                                sx={{
                                    p: 0,
                                    minWidth: 0,
                                    fontSize: '10.5px',
                                    textTransform: 'none',
                                    color: '#60a5fa',
                                    background: 'none',
                                    fontWeight: 500,
                                    borderRadius: '6px',
                                    '&:hover': { color: '#2563eb', background: '#f5faff' },
                                }}
                                onClick={() => handleReplyClick(comment._id)}
                            >
                                {replyOpen[comment._id] ? 'Cancel' : 'Reply'}
                            </Button>
                            {replyOpen[comment._id] && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1, flex: 1 }}>
                                    <TextField
                                        size="small"
                                        placeholder="Reply..."
                                        value={replyTexts[comment._id] || ''}
                                        onChange={(e) => handleReplyChange(comment._id, e.target.value)}
                                        inputRef={inputRef}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        edge="end"
                                                        size="small"
                                                        sx={{
                                                            color: replyTexts[comment._id]?.trim() ? '#60a5fa' : '#bdbdbd',
                                                            borderRadius: '50%',
                                                            transition: 'color 0.2s',
                                                            "&:hover": { color: "#2563eb", background: "#f5faff" },
                                                            p: 0.5,
                                                        }}
                                                        onClick={() => handleReplySubmit(comment._id)}
                                                        disabled={!replyTexts[comment._id]?.trim()}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                                                            <line x1="22" y1="2" x2="11" y2="13" />
                                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                                        </svg>
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            flex: 1,
                                            background: "#fafafa",
                                            borderRadius: "12px",
                                            fontSize: "14px",
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "12px",
                                                background: "#fafafa",
                                                fontSize: "14px",
                                                paddingRight: "6px",
                                                boxShadow: "none !important",
                                                outline: "none !important",
                                                "& fieldset": {
                                                    borderColor: "var(--textFieldBorderColor, #ced4da)",
                                                    borderRadius: "12px",
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: "var(--textFieldBorderColor, #ced4da)",
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                                                    borderWidth: 1,
                                                },
                                            },
                                            "& .MuiInputBase-input": {
                                                padding: "8px 8px 8px 12px",
                                                fontSize: "14px",
                                                background: "#fafafa",
                                                borderRadius: "12px",
                                            },
                                            "& .MuiOutlinedInput-root.Mui-focused": {
                                                boxShadow: "none !important",
                                                outline: "none !important",
                                            },
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                        {/* Render replies recursively */}
                        {comment.replies && comment.replies.length > 0 && (
                            <Box sx={{ mt: 0.3 }}>
                                {comment.replies.map((reply, idx) => (
                                    <React.Fragment key={reply._id}>
                                        <CommentWithReplies
                                            comment={reply}
                                            replyOpen={replyOpen}
                                            replyTexts={replyTexts}
                                            handleReplyClick={handleReplyClick}
                                            handleReplyChange={handleReplyChange}
                                            handleReplySubmit={handleReplySubmit}
                                            getInitials={getInitials}
                                            level={level + 1}
                                        />
                                        {idx < comment.replies.length - 1 && <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '6px 0 6px 0' }} />}
                                    </React.Fragment>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>
                {/* Only show hr after main comment, not replies */}
                {level === 0 && <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0 10px 0' }} />}
            </Box>
        );
    };

    return (
        <>
            {/* Snackbar OUTSIDE of Container/Paper for visibility */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                sx={{ zIndex: 9999 }}
                disablePortal={false}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Container maxWidth={false} sx={{ width: "100%" }}>
                <Paper elevation={0} sx={{ p: 0, borderRadius: 3, boxShadow: 'none', width: "100%" }}>

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Grid container spacing={2}>
                            {/* Title */}
                            <Grid item xs={12}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        color: "#374151",
                                        mb: 0.5,
                                        textAlign: 'left'
                                    }}
                                >
                                    Title
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    error={!!formErrors.title}
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
                                        "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                                            borderWidth: 1,
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Description */}
                            <Grid item xs={12}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        color: "#374151",
                                        mb: 0.5,
                                        textAlign: 'left'
                                    }}
                                >
                                    Description
                                </Typography>
                                <ReactQuill
                                    theme="snow"
                                    value={formData.description}
                                    onChange={handleDescriptionChange}
                                    placeholder="Write your task description here..."
                                    style={{
                                        marginBottom: 0,
                                        background: '#f7f9fc',
                                        borderRadius: 12,
                                        border: formErrors.description ? '1px solid #ef4444' : '1px solid #ced4da',
                                        minHeight: 120,
                                        fontFamily: 'inherit',
                                        width: '100%',
                                    }}
                                    modules={{
                                        toolbar: [
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'color': [] }, { 'background': [] }],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            [{ 'align': [] }],
                                        ]
                                    }}
                                    className="custom-quill"
                                />
                            </Grid>

                            {/* Assigned To & Status in one line */}
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        color: "#374151",
                                        mb: 0.5,
                                        textAlign: 'left'
                                    }}
                                >
                                    Assigned To
                                </Typography>
                                <Autocomplete
                                    multiple
                                    size="small"
                                    options={activeUserOptions}
                                    getOptionLabel={(option) => option.name || ''}
                                    value={getSelectedUsers()}
                                    onChange={(event, value) => handleChange(event, value)}
                                    disabled={isUserRole} // <-- Disable if user role is "user"
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select users to assign"
                                            name="assignedTo"
                                            error={!!formErrors.assignedTo}
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
                                                "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                                                    borderWidth: 1,
                                                },
                                            }}
                                        />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                variant="outlined"
                                                label={option.name}
                                                {...getTagProps({ index })}
                                                key={option._id}
                                                size="small"
                                                sx={{
                                                    borderColor: 'var(--purpleShadeBg, #343a40)',
                                                    color: '#374151',
                                                    backgroundColor: 'rgba(52, 58, 64, 0.08)',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    '& .MuiChip-deleteIcon': {
                                                        color: 'var(--purpleShadeBg, #343a40)',
                                                        background: 'transparent',
                                                        borderRadius: 0,
                                                        '&:hover': {
                                                            color: '#ef4444',
                                                            background: 'transparent',
                                                        },
                                                    },
                                                }}
                                            />
                                        ))
                                    }
                                    isOptionEqualToValue={(option, value) => option._id === value._id}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        color: "#374151",
                                        mb: 0.5,
                                        textAlign: 'left'
                                    }}
                                >
                                    Status
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={formData.status}
                                        onChange={handleChange}
                                        name="status"
                                        displayEmpty
                                        error={!!formErrors.status}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    marginTop: 8,
                                                    borderRadius: 12,
                                                    minWidth: 0,
                                                },
                                            },
                                            disableScrollLock: true,
                                            anchorOrigin: {
                                                vertical: "bottom",
                                                horizontal: "left",
                                            },
                                            transformOrigin: {
                                                vertical: "top",
                                                horizontal: "left",
                                            },
                                            getContentAnchorEl: null,
                                        }}
                                        sx={{
                                            fontSize: "14px",
                                            borderRadius: "12px",
                                            width: '100%',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'var(--textFieldBorderColor, #ced4da)',
                                                borderRadius: '12px',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'var(--textFieldBorderColor, #ced4da)',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'var(--textFieldFocusBorderColor, #343a40)',
                                                borderWidth: 1,
                                            },
                                        }}
                                    >
                                        {statusOptions.map(({ value, label }) => (
                                            <MenuItem
                                                key={value}
                                                value={value}
                                                sx={{ fontSize: "14px", color: 'var(--textColor, #374151)' }}
                                            >
                                                {label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Priority & Due Date in one line */}
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        color: "#374151",
                                        mb: 0.5,
                                        textAlign: 'left'
                                    }}
                                >
                                    Priority
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={formData.priority}
                                        onChange={handleChange}
                                        name="priority"
                                        displayEmpty
                                        error={!!formErrors.priority}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    marginTop: 8,
                                                    borderRadius: 12,
                                                    minWidth: 0,
                                                },
                                            },
                                            disableScrollLock: true,
                                            anchorOrigin: {
                                                vertical: "bottom",
                                                horizontal: "left",
                                            },
                                            transformOrigin: {
                                                vertical: "top",
                                                horizontal: "left",
                                            },
                                            getContentAnchorEl: null,
                                        }}
                                        sx={{
                                            fontSize: "14px",
                                            borderRadius: "12px",
                                            width: '100%',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'var(--textFieldBorderColor, #ced4da)',
                                                borderRadius: '12px',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'var(--textFieldBorderColor, #ced4da)',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'var(--textFieldFocusBorderColor, #343a40)',
                                                borderWidth: 1,
                                            },
                                        }}
                                    >
                                        {priorityOptions.map(({ value, label }) => (
                                            <MenuItem
                                                key={value}
                                                value={value}
                                                sx={{ fontSize: "14px", color: 'var(--textColor, #374151)' }}
                                            >
                                                {label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        color: "#374151",
                                        mb: 0.5,
                                        textAlign: 'left'
                                    }}
                                >
                                    Due Date
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="dueDate"
                                    type="date"
                                    value={dateInputs.dueDate || ''}
                                    onChange={handleChange}
                                    required
                                    error={!!formErrors.dueDate}
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
                                        "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                                            borderWidth: 1,
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Start/End Time - Only show in edit mode and if present, below Priority & Due Date */}
                            {isEdit && (currentTaskData?.startTime || currentTaskData?.endTime) && (
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 4,
                                            mt: 2,
                                            mb: 2,
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    color: "#4b5563", // gray-600
                                                    mb: 0.5,
                                                    letterSpacing: "0.5px",
                                                }}
                                            >
                                                START TIME
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontSize: "15px",
                                                    fontWeight: 500,
                                                    color: currentTaskData.startTime ? "#047857" : "#9ca3af", // green-700 or gray-400
                                                    letterSpacing: "0.2px",
                                                }}
                                            >
                                                {currentTaskData.startTime || "N/A"}
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                width: "1px",
                                                height: "24px",
                                                backgroundColor: "#e5e7eb",
                                            }}
                                        />

                                        <Box>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    color: "#4b5563", // gray-600
                                                    mb: 0.5,
                                                    letterSpacing: "0.5px",
                                                }}
                                            >
                                                END TIME
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontSize: "15px",
                                                    fontWeight: 500,
                                                    color: currentTaskData.endTime ? "#be123c" : "#9ca3af", // rose-700 or gray-400
                                                    letterSpacing: "0.2px",
                                                }}
                                            >
                                                {currentTaskData.endTime || "N/A"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            )}

                            {/* Comments Section - Only show in edit mode */}
                            {isEdit && currentTaskData?.comments && (
                                <Grid item xs={12}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            color: "#374151",
                                            mb: 0.5,
                                            textAlign: 'left'
                                        }}
                                    >
                                        Comments ({currentTaskData?.comments?.length || 0})
                                    </Typography>

                                    {/* Comments List */}
                                    <Box
                                        sx={{
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            borderRadius: '12px',
                                            border: '1px solid #e5e7eb',
                                            p: 2,
                                            mb: 2,
                                            // Register form scrollbar styling
                                            '&::-webkit-scrollbar': {
                                                width: '12px',
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                background: 'transparent',
                                                borderRadius: '12px',
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                                                borderRadius: '12px',
                                                border: '3px solid transparent',
                                                backgroundClip: 'padding-box',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)',
                                                },
                                            },
                                            '&::-webkit-scrollbar-corner': {
                                                background: 'transparent',
                                            },
                                            // Firefox scrollbar styling
                                            scrollbarWidth: 'thin',
                                            scrollbarColor: '#bdbdbd transparent',
                                        }}
                                    >
                                        {currentTaskData.comments && currentTaskData.comments.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                {[...currentTaskData.comments].reverse().map((comment) => (
                                                    <CommentWithReplies
                                                        key={comment._id}
                                                        comment={comment}
                                                        replyOpen={replyOpen}
                                                        replyTexts={replyTexts}
                                                        handleReplyClick={handleReplyClick}
                                                        handleReplyChange={handleReplyChange}
                                                        handleReplySubmit={handleReplySubmit}
                                                        getInitials={getInitials}
                                                    />
                                                ))}
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" sx={{ color: "#9ca3af", fontStyle: "italic", textAlign: "center", py: 2, fontSize: "14px" }}>
                                                No comments yet
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Add Comment Section */}
                                    <Box sx={{ display: "flex", gap: 2 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            multiline
                                            rows={2}
                                            placeholder="Add a comment..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            variant="outlined"
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
                                                "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                                                    borderWidth: 1,
                                                },
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={handleAddComment}
                                            disabled={!newComment.trim()}
                                            sx={{
                                                px: 2,
                                                py: 1,
                                                fontSize: "14px",
                                                fontWeight: 500,
                                                backgroundColor: "var(--purpleShadeBg, #343a40)",
                                                color: "white",
                                                borderRadius: "12px",
                                                textTransform: "none",
                                                boxShadow: "none",
                                                minWidth: "100px",
                                                height: "fit-content",
                                                alignSelf: "flex-end",
                                                "&:hover": {
                                                    backgroundColor: "var(--purpleShadeBg, #343a40)",
                                                    boxShadow: "none",
                                                },
                                            }}
                                        >
                                            Add
                                        </Button>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>

                        <Box display="flex" justifyContent="flex-end" mt={3} gap={1.5}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isLoading || isCreating || isUpdating}
                                sx={{
                                    px: 2,
                                    py: 1,
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    backgroundColor: "var(--purpleShadeBg, #343a40)",
                                    color: "white",
                                    borderRadius: "12px",
                                    textTransform: "none",
                                    boxShadow: "none",
                                    "&:hover": {
                                        backgroundColor: "var(--purpleShadeBg, #343a40)",
                                        boxShadow: "none",
                                    },
                                }}
                            >
                                {(isLoading || isCreating || isUpdating) ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <LoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                        <style>{`
                                            @keyframes spin {
                                                0% { transform: rotate(0deg); }
                                                100% { transform: rotate(360deg); }
                                            }
                                        `}</style>
                                    </span>
                                ) : (
                                    isEdit ? 'Update Task' : 'Create Task'
                                )}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </>
    );
};

export default TaskForm;