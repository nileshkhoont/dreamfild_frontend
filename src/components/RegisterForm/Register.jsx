import React, { useState } from "react";
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
  Avatar,
  IconButton,
  Chip,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import { User, X, Upload, FileText, Camera } from "lucide-react";
import { HiUserAdd } from "react-icons/hi";
import dayjs from "dayjs";
import { LoaderCircle } from "lucide-react";
import { useRegisterUserMutation } from "../../apiService";
import { useNavigate } from "react-router-dom";
import "../../App.css";

const Register = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
    deviceId: "",
    designation: "",
    dateOfBirth: "",
    dateOfJoining: "",
    emergencyContactNumber: "",
    bloodGroup: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    profilePhoto: null,
    chequeImage: null,
    otherDocuments: [],
  });

  // Separate state for HTML date inputs (YYYY-MM-DD format)
  const [dateInputs, setDateInputs] = useState({
    dateOfBirth: "",
    dateOfJoining: "",
  });

  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [chequeImagePreview, setChequeImagePreview] = useState("");
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();

  const bloodGroupOptions = [
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
  ];

  const personalInfoFields = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Password", type: "password", required: true },
    { name: "phone", label: "Phone", type: "text", required: false },
    {
      name: "designation",
      label: "Designation",
      type: "text",
      required: false,
    },
    {
      name: "dateOfBirth",
      label: "Date of Birth",
      type: "date",
      required: false,
    },
    {
      name: "dateOfJoining",
      label: "Date of Joining",
      type: "date",
      required: false,
    },
    {
      name: "emergencyContactNumber",
      label: "Emergency Contact Number",
      type: "text",
      required: false,
    },
    {
      name: "bloodGroup",
      label: "Blood Group",
      type: "select",
      required: false,
      options: bloodGroupOptions,
    },
  ];

  const bankDetailsFields = [
    { name: "accountHolderName", label: "Account Holder Name", type: "text" },
    { name: "accountNumber", label: "Account Number", type: "text" },
    { name: "ifscCode", label: "IFSC Code", type: "text" },
    { name: "branchName", label: "Branch Name", type: "text" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dateOfBirth" || name === "dateOfJoining") {
      // Store the YYYY-MM-DD value for the input
      setDateInputs((prev) => ({ ...prev, [name]: value }));

      // Convert yyyy-mm-dd → dd-mm-yyyy for form data
      if (value) {
        const formattedDate = dayjs(value).format("DD-MM-YYYY");
        setFormData((prev) => ({ ...prev, [name]: formattedDate }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: "" }));
      }
      if (formErrors[name]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
      return;
    }

    // Only allow numbers and max 10 digits for phone and emergencyContactNumber
    if (name === "phone" || name === "emergencyContactNumber") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
      if (formErrors[name]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } else if (name === "designation") {
      // Only allow letters and spaces
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData((prev) => ({
        ...prev,
        designation: lettersOnly,
      }));
      if (formErrors[name]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } else if (name === "email") {
      // Allow uppercase input, but restrict to valid email characters
      const filtered = value.replace(/[^a-zA-Z0-9@._-]/g, "");
      setFormData((prev) => ({
        ...prev,
        email: filtered,
      }));
      if (formErrors[name]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (formErrors[name]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: "Please select a valid image file (JPEG, JPG, PNG, GIF)",
          severity: "error",
        });
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setSnackbar({
          open: true,
          message: "File size should be less than 5MB",
          severity: "error",
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        profilePhoto: file,
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear any existing error
      if (formErrors.profilePhoto) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.profilePhoto;
          return newErrors;
        });
      }
    }
  };

  const handleChequeImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: "Please select a valid image file (JPEG, JPG, PNG, GIF)",
          severity: "error",
        });
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setSnackbar({
          open: true,
          message: "File size should be less than 5MB",
          severity: "error",
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        chequeImage: file,
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setChequeImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear any existing error
      if (formErrors.chequeImage) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.chequeImage;
          return newErrors;
        });
      }
    }
  };

  const handleOtherDocumentsChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate each file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const validFiles = [];
    let hasError = false;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: `Invalid file type: ${file.name}. Allowed types: JPEG, JPG, PNG, GIF, PDF, DOC, DOCX`,
          severity: "error",
        });
        hasError = true;
        break;
      }

      if (file.size > maxSize) {
        setSnackbar({
          open: true,
          message: `File too large: ${file.name}. Maximum size is 5MB`,
          severity: "error",
        });
        hasError = true;
        break;
      }

      validFiles.push(file);
    }

    if (!hasError) {
      setFormData((prev) => ({
        ...prev,
        otherDocuments: [...prev.otherDocuments, ...validFiles],
      }));

      // Clear any existing error
      if (formErrors.otherDocuments) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.otherDocuments;
          return newErrors;
        });
      }
    }
  };

  const removeOtherDocument = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      otherDocuments: prev.otherDocuments.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted"); // Debug log

    // Frontend validation for required fields - only name, email, and password
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.password) errors.password = "Password is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors); // Debug log
      return;
    }

    try {
      console.log("Creating FormData..."); // Debug log

      // Create FormData for file upload
      const submitData = new FormData();
      const formDataToSubmit = {
        ...formData,
        email: formData.email.toLowerCase(), // Convert email to lowercase before submit
      };

      // Append all form fields
      Object.keys(formDataToSubmit).forEach((key) => {
        if (key === "profilePhoto" && formDataToSubmit[key]) {
          submitData.append("profilePhoto", formDataToSubmit[key]);
          console.log("Added profilePhoto:", formDataToSubmit[key].name); // Debug log
        } else if (key === "chequeImage" && formDataToSubmit[key]) {
          submitData.append("chequeImage", formDataToSubmit[key]);
          console.log("Added chequeImage:", formDataToSubmit[key].name); // Debug log
        } else if (
          key === "otherDocuments" &&
          formDataToSubmit[key].length > 0
        ) {
          formDataToSubmit[key].forEach((file, index) => {
            submitData.append("otherDocuments", file);
            console.log(`Added otherDocument ${index}:`, file.name); // Debug log
          });
        } else if (
          key !== "profilePhoto" &&
          key !== "chequeImage" &&
          key !== "otherDocuments"
        ) {
          submitData.append(key, formDataToSubmit[key]);
          console.log(`Added ${key}:`, formDataToSubmit[key]); // Debug log
        }
      });

      console.log("Calling registerUser API..."); // Debug log

      const res = await registerUser(submitData).unwrap();

      console.log("API Response:", res); // Debug log

      setSnackbar({
        open: true,
        message:
          res?.responseMessage || res?.message || "Registration successful!",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/user-list"); // Automatically go to user-list after success
        if (onSuccess) {
          onSuccess();
        }
      }, 1200); // 1.2 seconds, adjust as needed

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "user",
        deviceId: "",
        designation: "",
        dateOfBirth: "",
        dateOfJoining: "",
        emergencyContactNumber: "",
        bloodGroup: "",
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        branchName: "",
        profilePhoto: null,
        chequeImage: null,
        otherDocuments: [],
      });
      setDateInputs({
        dateOfBirth: "",
        dateOfJoining: "",
      });
      setProfilePhotoPreview("");
      setChequeImagePreview("");
      setFormErrors({});
    } catch (err) {
      console.error("API Error:", err); // Debug log

      if (err?.data?.errors && typeof err.data.errors === "object") {
        setFormErrors(err.data.errors);
        setSnackbar({
          open: true,
          message:
            err?.data?.responseMessage ||
            err?.data?.message ||
            "Please fix the highlighted errors.",
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message:
            err?.data?.responseMessage ||
            err?.data?.message ||
            "Registration failed",
          severity: "error",
        });
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Keep Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        sx={{ zIndex: 9999 }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Paper
        elevation={2}
        sx={{
          backgroundColor: "white",
          width: "100%",
          p: 4,
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          // Keep scrollbar styling
          "&::-webkit-scrollbar": {
            width: "12px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
            borderRadius: "12px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
            borderRadius: "12px",
            border: "3px solid transparent",
            backgroundClip: "padding-box",
          },
          scrollbarWidth: "thin",
          scrollbarColor: "#bdbdbd transparent",
        }}
      >
        {/* Header with Back Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HiUserAdd size={24} color="var(--textColor, #374151)" />
            <Typography
              variant="h6"
              sx={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#1f2937",
              }}
            >
              Register New Employee
            </Typography>
          </Box>
          <Button
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
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Box>

        {/* Keep existing form content */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Personal Information Section */}
          <Typography
            variant="h6"
            sx={{
              fontSize: "20px", // Increased font size for more prominence
              fontWeight: 700, // Bolder font weight
              color: "#374151",
              mb: 2,
              letterSpacing: 0.2,
              textTransform: "none",
            }}
          >
            Personal Information
          </Typography>
          <Divider sx={{ mb: 3 }} /> {/* Divider below the section title */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Profile Photo */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      backgroundColor: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      border: "3px solid #e5e7eb",
                    }}
                  >
                    {profilePhotoPreview ? (
                      <img
                        src={profilePhotoPreview}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <User size={32} color="#9ca3af" />
                    )}
                  </Box>
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: -5,
                      right: -5,
                      backgroundColor: "var(--backgroundColor, #2563eb)", // Use background color variable
                      color: "var(--textColor, #374151)", // Use text color variable for icon
                      width: 35,
                      height: 35,
                      borderRadius: "50%", // Matching circular design
                      "&:hover": {
                        backgroundColor: "var(--backgroundColor, #1d4ed8)",
                      },
                    }}
                  >
                    <Camera size={16} color="var(--textColor, #374151)" />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                    />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="#6b7280">
                  Upload your profile photo
                </Typography>
              </Box>
            </Grid>

            {personalInfoFields.map((field) => (
              <Grid item xs={12} md={6} key={field.name}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    mb: 0.5,
                    textAlign: "left",
                  }}
                >
                  {field.label}
                </Typography>
                {field.type === "select" ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData[field.name]}
                      onChange={handleChange}
                      name={field.name}
                      displayEmpty
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
                        width: "100%",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--textFieldBorderColor, #ced4da)",
                          borderRadius: "12px",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--textFieldBorderColor, #ced4da)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor:
                            "var(--textFieldFocusBorderColor, #343a40)",
                          borderWidth: 1,
                        },
                      }}
                      fullWidth
                    >
                      <MenuItem
                        value=""
                        disabled
                        sx={{
                          fontSize: "14px",
                          color: "var(--textColor, #374151)",
                        }}
                      >
                        Select
                      </MenuItem>
                      {field.options.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          sx={{
                            fontSize: "14px",
                            color: "var(--textColor, #374151)",
                          }}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    type={field.type}
                    name={field.name}
                    value={
                      field.type === "date"
                        ? dateInputs[field.name] || ""
                        : formData[field.name]
                    }
                    onChange={handleChange}
                    required={field.required}
                    error={Boolean(formErrors[field.name])} // <-- Highlight error
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: "14px",
                        borderRadius: "12px",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: formErrors[field.name]
                          ? "#f44336" // Red border for error
                          : "var(--textFieldBorderColor, #ced4da)",
                        borderRadius: "12px",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: formErrors[field.name]
                          ? "#f44336"
                          : "var(--textFieldBorderColor, #ced4da)",
                      },
                      "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: formErrors[field.name]
                          ? "#f44336"
                          : "var(--textFieldFocusBorderColor, #343a40)",
                        borderWidth: 1,
                      },
                    }}
                  />
                )}
              </Grid>
            ))}
          </Grid>
          {/* Bank Details Section */}
          <Typography
            variant="h6"
            sx={{
              fontSize: "20px", // Increased font size for more prominence
              fontWeight: 700, // Bolder font weight
              color: "#374151",
              mb: 2,
              letterSpacing: 0.2,
              textTransform: "none",
              marginTop: 5, // Add margin top for spacing
            }}
          >
            Bank Details
          </Typography>
          <Divider sx={{ mb: 3 }} /> {/* Divider below the section title */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {bankDetailsFields.map((field) => (
              <Grid item xs={12} md={6} key={field.name}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    mb: 0.5,
                    textAlign: "left",
                  }}
                >
                  {field.label}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
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
                    "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor:
                        "var(--textFieldFocusBorderColor, #343a40)",
                      borderWidth: 1,
                    },
                  }}
                />
              </Grid>
            ))}

            {/* Cheque Image Section */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  mb: 0.5,
                  textAlign: "left",
                }}
              >
                Cheque Image
              </Typography>
              <Box
                sx={{
                  borderRadius: "12px",
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  minHeight: "120px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "transparent",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "var(--textColor, #374151)", // Keep border color consistent on hover
                    backgroundColor: "rgba(59, 130, 246, 0.05)",
                  },
                }}
                component="label"
              >
                {chequeImagePreview ? (
                  <Box sx={{ width: "100%" }}>
                    <img
                      src={chequeImagePreview}
                      alt="Cheque preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100px",
                        borderRadius: "8px",
                        objectFit: "cover",
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
                      {formData.chequeImage?.name || "Cheque image selected"}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center" }}>
                    <Upload size={32} color="var(--textColor, #374151)" />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#374151",
                        mt: 1,
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      Upload Cheque Image
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
                  hidden
                  accept="image/*"
                  onChange={handleChequeImageChange}
                />
              </Box>
            </Grid>

            {/* Other Documents Section */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  mb: 0.5,
                  textAlign: "left",
                }}
              >
                Other Documents
              </Typography>
              <Box
                sx={{
                  borderRadius: "12px", // Matching form radius
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  minHeight: "120px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "transparent",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.05)",
                  },
                }}
                component="label"
              >
                <FileText size={32} color="var(--textColor, #374151)" />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#374151",
                    mt: 1,
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Upload Documents
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
                  PDF, DOC, DOCX, Images (Max 5MB each)
                </Typography>
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleOtherDocumentsChange}
                />
              </Box>

              {/* Display selected documents */}
              {formData.otherDocuments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#374151",
                      mb: 1,
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    Selected Documents ({formData.otherDocuments.length}):
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      maxHeight: "100px",
                      overflowY: "auto",
                    }}
                  >
                    {formData.otherDocuments.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        variant="outlined"
                        size="small"
                        onDelete={() => removeOtherDocument(index)}
                        deleteIcon={<X size={14} />}
                        sx={{
                          maxWidth: "180px",
                          height: "32px",
                          fontSize: "12px",
                          borderColor: "var(--textFieldBorderColor, #ced4da)",
                          color: "#374151",
                          backgroundColor: "rgba(59, 130, 246, 0.08)",
                          borderRadius: "12px",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              mt: 3,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                px: 2,
                py: 1,
                fontSize: "14px",
                fontWeight: 500,
                backgroundColor: "var(--purpleShadeBg, #343a40)", // Use purple shade bg
                color: "white",
                borderRadius: "12px", // Matching form radius
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "var(--purpleShadeBg, #343a40)",
                  boxShadow: "none",
                },
              }}
            >
              {isLoading ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LoaderCircle
                    size={16}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <style>{`
                                                @keyframes spin {
                                                    0% { transform: rotate(0deg); }
                                                    100% { transform: rotate(360deg); }
                                                }
                                            `}</style>
                </span>
              ) : (
                "Create User"
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
