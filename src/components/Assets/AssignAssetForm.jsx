import React from "react";
import {
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  Grid,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useGetUsersQuery } from "../../apiService";
import { useGetAssetsQuery, useAssignAssetMutation, useUpdateAssetMutation } from "../../API/assets";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import { MdAssignmentReturn } from "react-icons/md"; // Add this import at the top


const AssignAssetForm = ({ onClose, onSuccess, editData }) => {
  const [form, setForm] = React.useState({
    userIds: [], // <-- change from userId to userIds (array)
    assetId: "",
    assignedDate: "",
    returnDate: "",
    quantity: 1,
    condition: "Good",
    userReturnCondition: "",
  });
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const { data: assetsData, isLoading: assetsLoading } = useGetAssetsQuery();
  const [assignAsset, { isLoading: isAssigning }] = useAssignAssetMutation();
  const [updateAsset, { isLoading: isUpdating }] = useUpdateAssetMutation();

  const users = usersData?.responseData?.data || [];
  const assets = assetsData?.responseData?.assets || [];

  // Prefill form if editing
  React.useEffect(() => {
    if (editData) {
      setForm({
        userIds: editData.assignments
          ? editData.assignments.map(a => a.userId?._id).filter(Boolean)
          : [editData.assignment?.userId?._id].filter(Boolean),
        assetId: editData._id || "",
        assignedDate: editData.assignment?.assignedDate || "",
        returnDate: editData.assignment?.returnDate || "",
        quantity: editData.assignment?.quantity || 1,
        condition: editData.assignment?.condition || "Good",
        userReturnCondition: editData.assignment?.returnCondition || "",
      });
    }
  }, [editData]);

  // For Autocomplete value
  const selectedUsers = users.filter(u => form.userIds.includes(u._id));

  // Handle change for Autocomplete
  const handleUserChange = (event, value) => {
    setForm({ ...form, userIds: value.map(u => u._id) });
  };

  // Helper functions
  function toInputDate(str) {
    // Handles dd-mm-yyyy and dd-MMM-yyyy (e.g., 07-08-2025 or 07-Aug-2025)
    if (!str) return "";
    const [dd, mmOrMMM, yyyy] = str.split("-");
    if (!dd || !mmOrMMM || !yyyy) return "";
    let mm = mmOrMMM;
    // If month is a string (e.g., "Aug"), convert to number
    if (isNaN(mmOrMMM)) {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const idx = months.findIndex(m => m.toLowerCase() === mmOrMMM.slice(0,3).toLowerCase());
      mm = idx !== -1 ? String(idx + 1).padStart(2, "0") : "";
    }
    return `${yyyy}-${mm}-${dd}`;
  }
  function toDisplayDate(str) {
    // Converts yyyy-mm-dd to dd-mm-yyyy for state and submission
    if (!str) return "";
    const [yyyy, mm, dd] = str.split("-");
    if (!yyyy || !mm || !dd) return "";
    return `${dd}-${mm}-${yyyy}`;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "assignedDate" || name === "returnDate") {
      // value from input is always yyyy-mm-dd, store as dd-mm-yyyy
      setForm({ ...form, [name]: toDisplayDate(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  // Manual validation for users
  if (!form.userIds || form.userIds.length === 0) {
    setSnackbar({
      open: true,
      message: "Please select at least one user.",
      severity: "error",
    });
    return;
  }
  try {
    if (editData) {
      // EDIT MODE: Call updateAsset with correct payload structure
      const payload = {
        assetId: form.assetId,
        userId: form.userIds[0], // Send the first selected user
        assignmentId: editData.assignment?._id, // Include assignment ID if available
        returnCondition: form.userReturnCondition,
        assignedDate: form.assignedDate,
        returnDate: form.returnDate,
        quantity: form.quantity,
        assetCondition: form.condition
      };
      
      console.log("Update payload:", payload); // Debug log
      
      const response = await updateAsset(payload).unwrap();
      setSnackbar({
        open: true,
        message: response?.responseMessage || "Asset updated successfully!",
        severity: "success",
      });
    } else {
      // ASSIGN MODE: Call assignAsset
      const payload = {
        ...form,
        assignedDate: form.assignedDate,
        returnDate: form.returnDate,
        returnCondition: form.userReturnCondition,
        userIds: form.userIds,
      };
      const response = await assignAsset(payload).unwrap();
      setSnackbar({
        open: true,
        message: response?.responseMessage || "Asset assigned successfully!",
        severity: "success",
      });
    }
    setTimeout(() => {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }, 2000);
  } catch (error) {
    console.error("Error submitting form:", error); // Debug log
    setSnackbar({
      open: true,
      message:
        error?.data?.responseMessage ||
        error?.data?.message ||
        error?.message ||
        "Failed to save asset",
      severity: "error",
    });
  }
};

  // Custom style for modal and fields
  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    zIndex: 1300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  };
  const paperStyle = {
    background: "#fff",
    borderRadius: 24,
    padding: 24,
    minWidth: 400,
    maxWidth: 600,
    width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    position: "relative",
  };
  const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 18,
  };
  const labelStyle = {
    fontWeight: 500,
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  };
  // Consistent border for fields (hover/focus)
  const inputBaseStyle = {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #ced4da",
    fontSize: 14,
    height: 40,
    outline: "none",
    transition: "border-color 0.2s",
  };

  // Add focus and hover border color using inline style and onFocus/onBlur/onMouseEnter/onMouseLeave
  const [focusField, setFocusField] = React.useState("");
  const [hoverField, setHoverField] = React.useState("");

  const getFieldBorder = (field) => {
    if (focusField === field) return "1px solid var(--textFieldFocusBorderColor, #343a40)";
    if (hoverField === field) return "1px solid #bdbdbd";
    return "1px solid #ced4da";
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <form
        style={paperStyle}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        {/* Modal Header with Close Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 20 }}>
            <MdAssignmentReturn size={22} color="#191919" />
            {editData ? "Edit Asset Assignment" : "Assign Asset"}
          </div>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#6b7280",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginBottom: 16,
          }}
        >
          <div style={fieldStyle}>
            <label htmlFor="userId" style={labelStyle}>
              User
            </label>
            <select
              id="userId"
              name="userId"
              value={form.userIds[0] || ""}
              onChange={e => setForm({ ...form, userIds: [e.target.value] })}
              required
              disabled={usersLoading}
              style={{
                ...inputBaseStyle,
                border: getFieldBorder("userId"),
              }}
              onFocus={() => setFocusField("userId")}
              onBlur={() => setFocusField("")}
              onMouseEnter={() => setHoverField("userId")}
              onMouseLeave={() => setHoverField("")}
            >
              <option value="">Select user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label htmlFor="assetId" style={labelStyle}>
              Asset
            </label>
            <select
              id="assetId"
              name="assetId"
              value={form.assetId}
              onChange={handleChange}
              required
              disabled={assetsLoading}
              style={{
                ...inputBaseStyle,
                border: getFieldBorder("assetId"),
              }}
              onFocus={() => setFocusField("assetId")}
              onBlur={() => setFocusField("")}
              onMouseEnter={() => setHoverField("assetId")}
              onMouseLeave={() => setHoverField("")}
            >
              <option value="">Select Asset</option>
              {assetsLoading ? (
                <option disabled>Loading...</option>
              ) : (
                assets.map((asset) => (
                  <option key={asset._id} value={asset._id}>
                    {asset.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div style={fieldStyle}>
            <label htmlFor="assignedDate" style={labelStyle}>
              Assigned Date
            </label>
            <input
              id="assignedDate"
              name="assignedDate"
              type="date"
              value={toInputDate(form.assignedDate)}
              onChange={handleChange}
              required
              style={{
                ...inputBaseStyle,
                border: getFieldBorder("assignedDate"),
              }}
              onFocus={() => setFocusField("assignedDate")}
              onBlur={() => setFocusField("")}
              onMouseEnter={() => setHoverField("assignedDate")}
              onMouseLeave={() => setHoverField("")}
            />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="returnDate" style={labelStyle}>
              Return Date
            </label>
            <input
              id="returnDate"
              name="returnDate"
              type="date"
              value={toInputDate(form.returnDate)}
              onChange={handleChange}
              style={{
                ...inputBaseStyle,
                border: getFieldBorder("returnDate"),
              }}
              onFocus={() => setFocusField("returnDate")}
              onBlur={() => setFocusField("")}
              onMouseEnter={() => setHoverField("returnDate")}
              onMouseLeave={() => setHoverField("")}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label htmlFor="quantity" style={labelStyle}>
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              value={form.quantity || 1}
              onChange={handleChange}
              required
              style={{
                ...inputBaseStyle,
                border: getFieldBorder("quantity"),
                width: "100%",
              }}
              onFocus={() => setFocusField("quantity")}
              onBlur={() => setFocusField("")}
              onMouseEnter={() => setHoverField("quantity")}
              onMouseLeave={() => setHoverField("")}
            />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label htmlFor="condition" style={labelStyle}>
              Asset Condition
            </label>
            <select
              id="condition"
              name="condition"
              value={form.condition}
              onChange={handleChange}
              required
              style={{
                ...inputBaseStyle,
                border: getFieldBorder("condition"),
                width: "100%",
              }}
              onFocus={() => setFocusField("condition")}
              onBlur={() => setFocusField("")}
              onMouseEnter={() => setHoverField("condition")}
              onMouseLeave={() => setHoverField("")}
            >
              <option value="Good">Good</option>
              <option value="Damaged">Damaged</option>
              <option value="Missing">Missing</option>
            </select>
          </div>
        </div>
        {/* Only show User Return Condition in edit mode */}
        {editData && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", marginBottom: 18 }}>
            <label htmlFor="userReturnCondition" style={labelStyle}>
              User Return Condition
            </label>
            <select
              id="userReturnCondition"
              name="userReturnCondition"
              value={form.userReturnCondition}
              onChange={handleChange}
              // removed required to make it optional
              style={{
                ...inputBaseStyle,
                border: getFieldBorder("userReturnCondition"),
                width: "100%",
              }}
              onFocus={() => setFocusField("userReturnCondition")}
              onBlur={() => setFocusField("")}
              onMouseEnter={() => setHoverField("userReturnCondition")}
              onMouseLeave={() => setHoverField("")}
            >
              <option value="">Select Condition</option>
              <option value="Good">Good</option>
              <option value="Damaged">Damaged</option>
              <option value="Missing">Missing</option>
            </select>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 32,
          }}
        >
          <Button
            onClick={onClose}
            color="inherit"
            size="small"
            sx={{
              borderRadius: "12px",
              fontWeight: 500,
              fontSize: "14px",
              height: "40px",
              minWidth: "120px",
              background: "#f3f4f6",
              color: "#374151",
              boxShadow: "none",
              textTransform: "none",
              px: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            sx={{
              borderRadius: "12px",
              fontWeight: 500,
              fontSize: "14px",
              height: "40px",
              minWidth: "120px",
              background: "var(--purpleShadeBg)",
              color: "white",
              boxShadow: "none",
              textTransform: "none",
              px: 2,
              "&:hover": {
                background: "var(--purpleShadeBg)",
                boxShadow: "none",
              },
            }}
            disabled={isAssigning || isUpdating}
          >
            {(isAssigning || isUpdating) ? (
              <>
                <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
              
              </>
            ) : (
              editData ? "Update" : "Assign"
            )}
          </Button>
        </div>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          onClose={handleSnackbarClose}
          sx={{ zIndex: 9999 }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </form>
    </div>
  );
};

export default AssignAssetForm;