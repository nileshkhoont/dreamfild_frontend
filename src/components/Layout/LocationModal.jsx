import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  CircularProgress,
  IconButton,
  Typography,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { AddLocation } from "@mui/icons-material";

import { MenuItem as MuiMenuItem } from "@mui/material";
import { useGetLocationQuery, useSetLocationMutation } from "../../apiService";

const defaultForm = {
  longitude: "",
  latitude: "",
  radius: "",
  address: "",
  punchOutTime: "", // <-- single string, e.g. "03:00 AM"
  missingPunchOutTime: "", // <-- single string, e.g. "05:30 PM"
};

const LocationModal = ({ open, onClose, isAdminRole = false }) => {
  const [locationFormData, setLocationFormData] = useState(defaultForm);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const orgId = JSON.parse(localStorage.getItem("user"))?.organization?._id || JSON.parse(localStorage.getItem("user"))?.organization;

  const {
    data: locationData,
    isLoading: isLocationLoading,
    refetch,
  } = useGetLocationQuery(orgId, { // <-- use orgId as query key
    skip: !isAdminRole || !orgId,
  });
  const [setLocationMutation, { isLoading: isSettingLocation }] =
    useSetLocationMutation();

  // Pre-fill form data if location exists
  useEffect(() => {
    if (
      locationData?.data &&
      typeof locationData.data.allowedLatitude === "number" &&
      typeof locationData.data.allowedLongitude === "number" &&
      typeof locationData.data.allowedRadius === "number"
    ) {
      setLocationFormData({
        latitude: locationData.data.allowedLatitude.toString(),
        longitude: locationData.data.allowedLongitude.toString(),
        radius: locationData.data.allowedRadius.toString(),
        address: locationData.data.address || "",
        punchOutTime: locationData.data.punchOutTime || "",
        missingPunchOutTime: locationData.data.missingPunchOutTime || "",
      });
    } else {
      setLocationFormData(defaultForm);
    }
  }, [locationData, open, isSettingLocation, orgId]); // <-- add orgId to dependencies

  const handleLocationFormChange = (e) => {
    const { name, value } = e.target;
    if (
      name === "address" ||
      name === "punchOutTime" ||
      name === "missingPunchOutTime"
    ) {
      setLocationFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      const numericValue = value.replace(/[^0-9.-]/g, "");
      setLocationFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    }
  };

  const timeFormatRegex = /^(0[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;

  const handleLocationFormSave = async () => {
    if (
      !locationFormData.longitude ||
      !locationFormData.latitude ||
      !locationFormData.radius
    ) {
      setSnackbar({
        open: true,
        message: "Please fill in longitude, latitude, and radius fields",
        severity: "error",
      });
      return;
    }

    // Validate time format for punchOutTime and missingPunchOutTime
    if (
      locationFormData.punchOutTime &&
      !timeFormatRegex.test(locationFormData.punchOutTime.trim())
    ) {
      setSnackbar({
        open: true,
        message:
          "Late Checkin time must be in format HH:MM AM/PM (e.g. 03:00 AM)",
        severity: "error",
      });
      return;
    }
    if (
      locationFormData.missingPunchOutTime &&
      !timeFormatRegex.test(locationFormData.missingPunchOutTime.trim())
    ) {
      setSnackbar({
        open: true,
        message:
          "Missing Punch Out Time must be in format HH:MM AM/PM (e.g. 05:30 PM)",
        severity: "error",
      });
      return;
    }

    try {
      const response = await setLocationMutation({
        allowedLatitude: parseFloat(locationFormData.latitude),
        allowedLongitude: parseFloat(locationFormData.longitude),
        allowedRadius: parseFloat(locationFormData.radius),
        address: locationFormData.address || "",
        punchOutTime: locationFormData.punchOutTime,
        missingPunchOutTime: locationFormData.missingPunchOutTime,
      }).unwrap();

      setSnackbar({
        open: true,
        message: response?.message || "Location saved successfully!",
        severity: "success",
      });

      await refetch();

      onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to save location",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Common TextField styling to be applied to all fields
  const textFieldStyle = {
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
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <AddLocation sx={{ color: "var(--purpleShadeBg)" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {locationData?.data?.allowedLatitude
                ? "Update Geolocation"
                : "Set Geolocation Required"}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ ml: 2 }}
            size="small"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M6 6L14 14M14 6L6 14"
                stroke="#888"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Latitude & Longitude side by side */}
            <Grid item xs={12} md={6}>
              <Box mb={1}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#374151",
                    fontWeight: 500,
                    fontSize: "14px",
                    mb: 0.5,
                    textAlign: "left",
                  }}
                >
                  Latitude
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter latitude"
                  name="latitude"
                  value={locationFormData.latitude}
                  onChange={handleLocationFormChange}
                  inputProps={{ pattern: "[0-9.-]*", inputMode: "decimal" }}
                  InputLabelProps={{ shrink: true, disableAnimation: true }}
                  sx={textFieldStyle}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box mb={1}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#374151",
                    fontWeight: 500,
                    fontSize: "14px",
                    mb: 0.5,
                    textAlign: "left",
                  }}
                >
                  Longitude
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter longitude"
                  name="longitude"
                  value={locationFormData.longitude}
                  onChange={handleLocationFormChange}
                  inputProps={{ pattern: "[0-9.-]*", inputMode: "decimal" }}
                  InputLabelProps={{ shrink: true, disableAnimation: true }}
                  sx={textFieldStyle}
                />
              </Box>
            </Grid>
            {/* Radius */}
            <Grid item xs={12}>
              <Box mb={1}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#374151",
                    fontWeight: 500,
                    fontSize: "14px",
                    mb: 0.5,
                    textAlign: "left",
                  }}
                >
                  Radius (meters)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter radius in meters"
                  name="radius"
                  value={locationFormData.radius}
                  onChange={handleLocationFormChange}
                  inputProps={{ pattern: "[0-9]*", inputMode: "numeric" }}
                  InputLabelProps={{ shrink: true, disableAnimation: true }}
                  sx={textFieldStyle}
                />
              </Box>
            </Grid>
            {/* Address */}
            <Grid item xs={12}>
              <Box mb={1}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#374151",
                    fontWeight: 500,
                    fontSize: "14px",
                    mb: 0.5,
                    textAlign: "left",
                  }}
                >
                  Address (Optional)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter office address (optional)"
                  name="address"
                  value={locationFormData.address}
                  onChange={handleLocationFormChange}
                  multiline
                  rows={2}
                  InputLabelProps={{ shrink: true, disableAnimation: true }}
                  sx={{
                    ...textFieldStyle,
                    "& .MuiInputBase-root": {
                      ...textFieldStyle["& .MuiInputBase-root"],
                      height: "auto", // Override for multiline
                    },
                  }}
                />
              </Box>
            </Grid>
            {/* Late Checkin & Missing Punch Out Time side by side */}
            <Grid item xs={12} md={6}>
              <Box mb={1}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#374151",
                    fontWeight: 500,
                    fontSize: "14px",
                    mb: 0.5,
                    textAlign: "left",
                  }}
                >
                  Late Checkin
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="03:00 AM"
                  name="punchOutTime"
                  value={locationFormData.punchOutTime}
                  onChange={handleLocationFormChange}
                  InputLabelProps={{ shrink: true, disableAnimation: true }}
                  sx={textFieldStyle}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box mb={1}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#374151",
                    fontWeight: 500,
                    fontSize: "14px",
                    mb: 0.5,
                    textAlign: "left",
                  }}
                >
                  Missing Punch Out Time
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="05:30 PM"
                  name="missingPunchOutTime"
                  value={locationFormData.missingPunchOutTime}
                  onChange={handleLocationFormChange}
                  InputLabelProps={{ shrink: true, disableAnimation: true }}
                  sx={textFieldStyle}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={handleLocationFormSave}
            variant="contained"
            color="primary"
            size="small"
            sx={{
              backgroundColor: "var(--purpleShadeBg)",
              color: "white",
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
                backgroundColor: "var(--purpleShadeBg)",
                boxShadow: "none",
              },
            }}
            disabled={isSettingLocation}
          >
            {isSettingLocation ? (
              <CircularProgress size={20} color="inherit" />
            ) : locationData?.data?.allowedLatitude ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </DialogActions>
      </Dialog>
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
    </>
  );
};

export default LocationModal;
