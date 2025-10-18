import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    InputAdornment,
    TextField,
    IconButton,
} from "@mui/material";
import { AiOutlineCalendar } from "react-icons/ai";
import CloseIcon from "@mui/icons-material/Close";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useApplyWorkFromHomeMutation } from "../../apiService"; // 1. Import the hook
import { Laptop } from "lucide-react";
const WorkFromHomeModal = ({
    open,
    onClose,
    startDate,
    endDate,
    setDateRange,
    reason,
    setReason,
    submitted,
    setSubmitted,
    showSnackbar, // <-- receive the callback
}) => {
    const [applyWorkFromHome, { isLoading, error }] = useApplyWorkFromHomeMutation();

    // Helper to format date as YYYY-MM-DD in local time
    const formatDate = (date) =>
        date
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
            : "";

    // 2. Handle submit
    const handleSubmit = async () => {
        setSubmitted(true);
        if (!startDate || !endDate || !reason) return;

        // Format dates without adding a day
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        try {
            const res = await applyWorkFromHome({
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                reason,
            }).unwrap();
            // Show backend message from response
            showSnackbar?.(
                res?.message || res?.responseMessage || "Applied for rw!",
                res?.statusCode === 200 ? "success" : "info"
            );
            onClose();
        } catch (e) {
            // Show backend error message if present
            showSnackbar?.(
                e?.data?.message || e?.data?.responseMessage || "Failed to apply for rw",
                "error"
            );
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    minHeight: 420, // ⬅️ Increased from 380 to avoid scroll jump
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
                <Laptop size={22} />
                Apply for Remote Work
                <IconButton
                    onClick={onClose}
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
                {/* Date‑range picker */}
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <DatePicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={setDateRange}
                        isClearable
                        placeholderText="Select date range"
                        dateFormat="dd/MM/yyyy"
                        popperPlacement="bottom-start"
                        popperProps={{ strategy: "absolute" }}
                        calendarClassName="custom-datepicker-calendar"
                        dayClassName={(date) => {
                            const inRange =
                                startDate && endDate && date >= startDate && date <= endDate;
                            return inRange ? "custom-datepicker-selected" : "custom-datepicker-day";
                        }}
                        customInput={
                            <TextField
                                fullWidth
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AiOutlineCalendar size={16} color="#666" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    width: { xs: "100%", sm: "250px" },
                                    "& .MuiInputBase-root": {
                                        fontSize: "14px",
                                        borderRadius: "12px",
                                        height: "40px",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor:
                                            (!startDate || !endDate) && submitted
                                                ? "#f44336"
                                                : "var(--textFieldBorderColor, #ced4da)",
                                        borderRadius: "12px",
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor:
                                            (!startDate || !endDate) && submitted
                                                ? "#f44336"
                                                : "var(--textFieldBorderColor, #ced4da)",
                                    },
                                    "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline": {
                                        borderColor:
                                            (!startDate || !endDate) && submitted
                                                ? "#f44336"
                                                : "var(--textFieldFocusBorderColor, #343a40)",
                                        borderWidth: 1,
                                    },
                                }}
                            />
                        }
                    />
                </Box>

                {/* Reason */}
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                    }}
                >
                    <label
                        htmlFor="reason-input"
                        style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "var(--textColor, #374151)",
                            marginBottom: "4px",
                        }}
                    >
                        Reason <span style={{ color: "#f44336" }}>*</span>
                    </label>
                    <textarea
                        id="reason-input"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        required
                        style={{
                            width: "100%",
                            padding: "10px 14px",
                            fontSize: "14px",
                            fontFamily: "inherit",
                            borderRadius: "12px",
                            border:
                                !reason && submitted
                                    ? "1px solid #f44336"
                                    : "1px solid var(--textFieldBorderColor, #ced4da)",
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
                                !reason && submitted
                                    ? "#f44336"
                                    : "var(--textFieldBorderColor, #ced4da)";
                        }}
                        placeholder="Please provide a reason for your Rw request"
                    />
                    {!reason && submitted && (
                        <span style={{ color: "#f44336", fontSize: "12px" }}>
                            Please enter a reason for your Rw request
                        </span>
                    )}
                </Box>


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
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                    }}
                >
                    Cancel
                </Button>

                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
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
                    }}
                >
                    {isLoading ? (
                        <span>Submitting...</span>
                    ) : (
                        "Submit"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WorkFromHomeModal;