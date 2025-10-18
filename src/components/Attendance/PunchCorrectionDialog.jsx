import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { FileX2 } from "lucide-react";
import { useSubmitPunchCorrectionMutation } from "../../apiService";

const inputStyle = {
  borderRadius: "12px",
  border: "1px solid var(--textFieldBorderColor, #ced4da)",
  padding: "10px 12px",
  fontSize: "14px",
  width: "100%",
  marginBottom: "12px",
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
};

const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);
const minutes = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);
const ampm = ["AM", "PM"];

const PunchCorrectionDialog = ({
  open,
  onClose,
  attendanceId,
  initialTime = "",
  correctionType: correctionTypeProp = "punch-out",
  date = "",
  showSnackbar,
}) => {
  // Set initial time to 00:00 AM
  const [hour, setHour] = React.useState("00");
  const [minute, setMinute] = React.useState("00");
  const [period, setPeriod] = React.useState("AM");
  const [reason, setReason] = React.useState("");
  // Remove default radio selection
  const [correctionType, setCorrectionType] = React.useState("");

  // Add this line to fix isLoading error
  const [submitCorrection, { isLoading }] = useSubmitPunchCorrectionMutation();

  React.useEffect(() => {
    if (initialTime) {
      const [hm, p] = initialTime.split(" ");
      const [h, m] = hm.split(":");
      setHour(h || "00");
      setMinute(m || "00");
      setPeriod(p || "AM");
    } else {
      setHour("00");
      setMinute("00");
      setPeriod("AM");
    }
  }, [initialTime, open]);

  React.useEffect(() => {
    setCorrectionType(""); // No default selection
  }, [correctionTypeProp, open]);

  const handleSubmit = async () => {
    const requestedTime = `${hour}:${minute} ${period}`;
    const payload = {
      attendanceId,
      correctionType, // "punch-in" or "punch-out" from radio selection
      requestedTime,
      reason,
    };

    try {
      const res = await submitCorrection(payload).unwrap();
      showSnackbar(
        res?.message || "Correction request submitted successfully.",
        "success"
      );
      onClose();
    } catch (err) {
      showSnackbar(
        err?.data?.message ||
          err?.message ||
          "Failed to submit correction request.",
        "error"
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 20,
          color: "var(--purpleShadeBg)",
          pb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1.2,
        }}
      >
        <FileX2 size={22} color="var(--textColor)" />
        {correctionType === "punch-in"
          ? "Punch-in Correction"
          : correctionType === "punch-out"
          ? "Punch-out Correction"
          : "Punch Correction"}
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
        {/* Radio buttons for Punch-in/Punch-out */}
        <RadioGroup
          row
          value={correctionType}
          onChange={(e) => setCorrectionType(e.target.value)}
          sx={{ mb: 2 }}
        >
          <FormControlLabel
            value="punch-in"
            control={<Radio />}
            label="Punch-in"
          />
          <FormControlLabel
            value="punch-out"
            control={<Radio />}
            label="Punch-out"
          />
        </RadioGroup>

        {date && (
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 500, color: "var(--textColor)", opacity: 0.8 }}
          >
            Date: {date}
          </Typography>
        )}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <label
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--textColor, #374151)",
              marginBottom: "4px",
            }}
          >
            {correctionType === "punch-in" ? "Punch-in Time" : "Punch-out Time"}{" "}
            <span style={{ color: "#f44336" }}>*</span>
          </label>
          <Box sx={{ display: "flex", gap: 1 }}>
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              style={inputStyle}
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span style={{ alignSelf: "center", fontWeight: 600 }}>:</span>
            <select
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              style={inputStyle}
            >
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={inputStyle}
            >
              {ampm.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Box>
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
            placeholder={`Please provide a reason for ${
              correctionType === "punch-in" ? "punch-in" : "punch-out"
            } correction`}
          />
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
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PunchCorrectionDialog;
