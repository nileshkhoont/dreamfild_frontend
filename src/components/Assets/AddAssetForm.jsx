import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Grid,
  IconButton,
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { useCreateAssetMutation, useUpdateAssetMutation } from '../../API/assets';
import { Upload } from '@mui/icons-material';
import { MdAddBox } from "react-icons/md";
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon

const categories = [
  "Electronics",
  "Furniture",
  "Stationery",
  "Vehicle",
  "Other",
];

export const AddAssetForm = ({ asset, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    totalQuantity: '',
    totalAssignedQuantity: '0',
    assetImage: null,
  });

  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isLoading, setIsLoading] = useState(false);

  const [createAsset] = useCreateAssetMutation();
  const [updateAsset] = useUpdateAssetMutation();

  // Prefill form when editing
  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        category: asset.category || '',
        totalQuantity: asset.totalQuantity || '0', // Default to '0' if not present
        totalAssignedQuantity: asset.totalAssignedQuantity?.toString() || '0',
        assetImage: null, // Don't prefill file input
        assetId: asset._id,
      });
    } else {
      setFormData({
        name: '',
        category: '',
        totalQuantity: '0', // Default to '0'
        totalAssignedQuantity: '0',
        assetImage: null,
      });
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'assetImage') {
      setFormData((prev) => ({
        ...prev,
        assetImage: files && files[0] ? files[0] : null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.totalQuantity) errors.totalQuantity = 'Total Quantity is required';
    if (!asset && !formData.assetImage) errors.assetImage = 'Asset image is required';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);

    setSnackbar({
      open: true,
      message: asset ? 'Updating asset...' : 'Adding asset...',
      severity: 'info',
    });

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('totalQuantity', formData.totalQuantity);
    data.append('totalAssignedQuantity', formData.totalAssignedQuantity);
    if (formData.assetImage) data.append('assetImage', formData.assetImage);

    try {
      let response;
      if (asset) {
        data.append('assetId', formData.assetId);
        response = await updateAsset(data).unwrap();
        setSnackbar({
          open: true,
          message: response?.responseMessage || 'Asset updated successfully!',
          severity: 'success',
        });
      } else {
        response = await createAsset(data).unwrap();
        setSnackbar({
          open: true,
          message: response?.responseMessage || 'Asset added successfully!',
          severity: 'success',
        });
      }
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.responseMessage || error?.data?.message || 'Failed to save asset',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Modal and field styles (copied from AssignAssetForm)
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
  const [focusField, setFocusField] = useState("");
  const [hoverField, setHoverField] = useState("");

  const getFieldBorder = (field) => {
    if (focusField === field) return "1px solid var(--textFieldFocusBorderColor, #343a40)";
    if (hoverField === field) return "1px solid #bdbdbd";
    return "1px solid #ced4da";
  };

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={handleSnackbarClose}
        sx={{ zIndex: 9999 }}
        disablePortal={false}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <div style={modalStyle} onClick={onClose}>
        <form
          style={paperStyle}
          onClick={e => e.stopPropagation()}
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          {/* Modal Header with Close Button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 20 }}>
              <MdAddBox size={22} color="#191919" />
              {asset ? "Update Asset" : "Add Asset"}
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

          {/* Form Fields */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginBottom: 16,
            }}
          >
            <div style={fieldStyle}>
              <label htmlFor="name" style={labelStyle}>Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  ...inputBaseStyle,
                  border: getFieldBorder("name"),
                }}
                onFocus={() => setFocusField("name")}
                onBlur={() => setFocusField("")}
                onMouseEnter={() => setHoverField("name")}
                onMouseLeave={() => setHoverField("")}
              />
              {formErrors.name && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {formErrors.name}
                </Typography>
              )}
            </div>
            <div style={fieldStyle}>
              <label htmlFor="category" style={labelStyle}>Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                style={{
                  ...inputBaseStyle,
                  border: getFieldBorder("category"),
                }}
                onFocus={() => setFocusField("category")}
                onBlur={() => setFocusField("")}
                onMouseEnter={() => setHoverField("category")}
                onMouseLeave={() => setHoverField("")}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {formErrors.category && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {formErrors.category}
                </Typography>
              )}
            </div>
            <div style={fieldStyle}>
              <label htmlFor="totalQuantity" style={labelStyle}>Total Quantity</label>
              <input
                id="totalQuantity"
                name="totalQuantity"
                type="number"
                min={0}
                value={formData.totalQuantity}
                onChange={handleChange}
                required
                style={{
                  ...inputBaseStyle,
                  border: getFieldBorder("totalQuantity"),
                }}
                onFocus={() => setFocusField("totalQuantity")}
                onBlur={() => setFocusField("")}
                onMouseEnter={() => setHoverField("totalQuantity")}
                onMouseLeave={() => setHoverField("")}
              />
              {formErrors.totalQuantity && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {formErrors.totalQuantity}
                </Typography>
              )}
            </div>
          </div>
          {/* Asset Image - full width below */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Asset Image</label>
            <Box
              sx={{
                borderRadius: "12px",
                p: 2,
                textAlign: "center",
                cursor: "pointer",
                minHeight: "120px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f9fafb",
                border: "1px dashed #e5e7eb",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                  backgroundColor: "rgba(59, 130, 246, 0.05)",
                },
              }}
              component="label"
            >
              {formData.assetImage ? (
                <Box sx={{ width: "100%" }}>
                  <Box
                    component="img"
                    src={URL.createObjectURL(formData.assetImage)}
                    alt="Asset preview"
                    sx={{
                      width: "100%",
                      height: "180px",
                      borderRadius: "8px",
                      objectFit: "contain",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#6b7280",
                      mt: 1,
                      display: "block",
                      fontSize: "12px",
                      wordBreak: "break-word",
                    }}
                  >
                    {formData.assetImage.name}
                  </Typography>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setFormData(prev => ({ ...prev, assetImage: null }));
                    }}
                    size="small"
                    sx={{
                      mt: 1,
                      fontSize: "12px",
                      color: "#ef4444",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "rgba(239, 68, 68, 0.04)"
                      }
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", width: "100%" }}>
                  <Upload sx={{ fontSize: 40 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#374151",
                      mt: 1,
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Upload Asset Image
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#6b7280",
                      fontSize: "12px",
                      display: "block",
                      mt: 0.5,
                    }}
                  >
                    JPG, PNG, GIF (Max 5MB)
                  </Typography>
                </Box>
              )}
              <input
                type="file"
                name="assetImage"
                accept="image/*"
                hidden
                onChange={handleChange}
              />
            </Box>
            {formErrors.assetImage && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                {formErrors.assetImage}
              </Typography>
            )}
          </div>
          {/* Submit and Cancel Buttons */}
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
              disabled={isLoading}
            >
              {isLoading
                ? (asset ? "Saving..." : "Saving...")
                : (asset ? "Update" : "Add")}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddAssetForm;

