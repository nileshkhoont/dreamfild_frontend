import React, { useState, useEffect } from "react";
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
  IconButton,
  Chip,
  FormControl,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Camera, Upload, FileText, X, User } from "lucide-react";
import { FaUserEdit } from "react-icons/fa";
import dayjs from "dayjs";
import { LoaderCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useUpdateProfileMutation,
  useGetUserDetailsByIdQuery,
  useDeleteUserDocumentMutation,
} from "../../apiService";
import { CustomLoader, LoaderContainer } from "../Layout/CustomLoader";
import "../../App.css";
import PreviewImg from "./PreviewImg";

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Use RTK Query to fetch user details by ID
  const { data: userData, isLoading: userLoading } =
    useGetUserDetailsByIdQuery(id);

  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
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

  const [dateInputs, setDateInputs] = useState({
    dateOfBirth: "",
    dateOfJoining: "",
  });

  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [chequeImagePreview, setChequeImagePreview] = useState("");
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [existingOtherDocuments, setExistingOtherDocuments] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");

  const [deleteUserDocument] = useDeleteUserDocumentMutation();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState({
    idx: null,
    fileOrDoc: null,
    type: null,
    docUrl: null,
  });

  const bloodGroupOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ];

  // Populate form data when userData is loaded
  useEffect(() => {
    if (!userData) return;
    const user = userData?.responseData || userData;
    if (user) {
      const formatDateForInput = (dateStr) => {
        if (!dateStr) return "";
        // If already yyyy-mm-dd, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        // If dd-mm-yyyy, convert to yyyy-mm-dd
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
          const [day, month, year] = dateStr.split("-");
          return `${year}-${month}-${day}`;
        }
        // If 8 digits (ddmmyyyy), convert to yyyy-mm-dd
        if (/^\d{8}$/.test(dateStr)) {
          const day = dateStr.substring(0, 2);
          const month = dateStr.substring(2, 4);
          const year = dateStr.substring(4, 8);
          return `${year}-${month}-${day}`;
        }
        return dateStr;
      };

      setFormData({
        userId: user._id || "",
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "user",
        deviceId: user.deviceId || "",
        designation: user.designation || "",
        dateOfBirth: user.dateOfBirth || "",
        dateOfJoining: user.dateOfJoining || "",
        emergencyContactNumber: user.emergencyContactNumber || "",
        bloodGroup: user.bloodGroup || "",
        accountHolderName: user.bankDetails?.accountHolderName || "",
        accountNumber: user.bankDetails?.accountNumber || "",
        ifscCode: user.bankDetails?.ifscCode || "",
        branchName: user.bankDetails?.branchName || "",
        profilePhoto: null,
        chequeImage: user.bankDetails?.chequeImage || "",
        otherDocuments: [],
      });

      setDateInputs({
        dateOfBirth: formatDateForInput(user.dateOfBirth),
        dateOfJoining: formatDateForInput(user.dateOfJoining),
      });

      if (user.profilePhoto) {
        setProfilePhotoPreview(
          user.profilePhoto.startsWith("http")
            ? user.profilePhoto
            : `${import.meta.env.VITE_BACKEND_URL}/${user.profilePhoto}`
        );
      } else {
        setProfilePhotoPreview("");
      }
      if (user.bankDetails && user.bankDetails.chequeImage) {
        setChequeImagePreview(
          user.bankDetails.chequeImage.startsWith("http")
            ? user.bankDetails.chequeImage
            : null
        );
      } else {
        setChequeImagePreview("");
      }
      setExistingOtherDocuments(user.bankDetails?.otherDocuments || []);
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dateOfBirth" || name === "dateOfJoining") {
      setDateInputs((prev) => ({ ...prev, [name]: value }));

      // Convert yyyy-mm-dd → dd-mm-yyyy for backend
      if (value) {
        const formattedDate = dayjs(value).format("DD-MM-YYYY");
        setFormData((prev) => ({ ...prev, [name]: formattedDate }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: "" }));
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
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    }
  };

  const handleChequeImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    }
  };

  const handleOtherDocumentsChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      otherDocuments: [...prev.otherDocuments, ...files],
    }));
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
    console.log("Edit form submitted"); // Debug log

    try {
      console.log("Creating FormData for update..."); // Debug log

      let res;

      // If there are new files, create FormData
      if (
        formData.profilePhoto ||
        formData.chequeImage ||
        formData.otherDocuments.length > 0
      ) {
        const submitData = new FormData();

        // Append each field individually instead of as JSON
        submitData.append("userId", formData.userId || id);
        submitData.append("name", formData.name);
        submitData.append("email", formData.email);
        submitData.append("phone", formData.phone);
        submitData.append("role", formData.role);
        submitData.append("deviceId", formData.deviceId);
        submitData.append("designation", formData.designation);
        submitData.append("dateOfBirth", formData.dateOfBirth);
        submitData.append("dateOfJoining", formData.dateOfJoining);
        submitData.append(
          "emergencyContactNumber",
          formData.emergencyContactNumber
        );
        submitData.append("bloodGroup", formData.bloodGroup);

        // Bank details
        submitData.append("accountHolderName", formData.accountHolderName);
        submitData.append("accountNumber", formData.accountNumber);
        submitData.append("ifscCode", formData.ifscCode);
        submitData.append("branchName", formData.branchName);

        // Append files
        if (formData.profilePhoto) {
          submitData.append("profilePhoto", formData.profilePhoto);
          console.log("Added profilePhoto:", formData.profilePhoto.name); // Debug log
        }
        if (formData.chequeImage) {
          submitData.append("chequeImage", formData.chequeImage);
          console.log("Added chequeImage:", formData.chequeImage.name); // Debug log
        }
        if (formData.otherDocuments.length > 0) {
          formData.otherDocuments.forEach((file, index) => {
            submitData.append("otherDocuments", file);
            console.log(`Added otherDocument ${index}:`, file.name); // Debug log
          });
        }

        console.log("Calling updateProfile API with FormData..."); // Debug log
        // Log all FormData entries for debugging
        for (let pair of submitData.entries()) {
          console.log(pair[0] + ": " + pair[1]);
        }

        res = await updateProfile(submitData).unwrap();
      } else {
        // No new files, send JSON data
        const updateData = {
          userId: formData.userId || id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          deviceId: formData.deviceId,
          designation: formData.designation,
          dateOfBirth: formData.dateOfBirth,
          dateOfJoining: formData.dateOfJoining,
          emergencyContactNumber: formData.emergencyContactNumber,
          bloodGroup: formData.bloodGroup,
          bankDetails: {
            accountHolderName: formData.accountHolderName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            branchName: formData.branchName,
            chequeImage: userData?.bankDetails?.chequeImage || "",
            otherDocuments: userData?.bankDetails?.otherDocuments || [],
          },
        };

        console.log("Calling updateProfile API with JSON data..."); // Debug log
        res = await updateProfile(updateData).unwrap();
      }

      console.log("API Response:", res); // Debug log

      setSnackbar({
        open: true,
        message: res.message || "Profile updated successfully!",
        severity: "success",
      });
      setTimeout(() => {
        navigate(-1); // Go back after update
      }, 1200);
    } catch (err) {
      console.error("API Error:", err); // Debug log

      setSnackbar({
        open: true,
        message:
          err?.data?.message ||
          err?.data?.responseMessage ||
          "Profile update failed",
        severity: "error",
      });
    }
  };

  const personalInfoFields = [
    { name: "name", label: "Name", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Phone", type: "text" },

    { name: "designation", label: "Designation", type: "text" },
    { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    { name: "dateOfJoining", label: "Date of Joining", type: "date" },
    {
      name: "emergencyContactNumber",
      label: "Emergency Contact Number",
      type: "text",
    },
    {
      name: "bloodGroup",
      label: "Blood Group",
      type: "select",
      select: true,
      options: bloodGroupOptions,
    },
  ];

  const bankDetailsFields = [
    { name: "accountHolderName", label: "Account Holder Name", type: "text" },
    { name: "accountNumber", label: "Account Number", type: "text" },
    { name: "ifscCode", label: "IFSC Code", type: "text" },
    { name: "branchName", label: "Branch Name", type: "text" },
  ];

  // Open confirm dialog before delete
  const handleDeleteClick = (
    idx,
    fileOrDoc,
    type = "otherDocument",
    docUrl = null
  ) => {
    setPendingDelete({ idx, fileOrDoc, type, docUrl });
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmDialogOpen(false);
    try {
      if (pendingDelete.type === "profilePhoto") {
        await deleteUserDocument({
          userId: formData.userId || id,
          docUrl: profilePhotoPreview,
          type: "profilePhoto",
        }).unwrap();
        setProfilePhotoPreview("");
        setFormData((prev) => ({ ...prev, profilePhoto: null }));
        setSnackbar({
          open: true,
          message: "Profile photo deleted successfully!",
          severity: "success",
        });
      } else if (pendingDelete.type === "chequeImage") {
        await deleteUserDocument({
          userId: formData.userId || id,
          docUrl: chequeImagePreview, // or the relevant docUrl
          type: "chequeImage", // or "otherDocument", etc.
        }).unwrap();
        setChequeImagePreview("");
        setFormData((prev) => ({ ...prev, chequeImage: null }));
        setSnackbar({
          open: true,
          message: "Cheque image deleted successfully!",
          severity: "success",
        });
      } else if (pendingDelete.type === "otherDocument") {
        // Remove from backend if it's an existing doc, else just from local state
        if (pendingDelete.docUrl) {
          await deleteUserDocument({
            userId: formData.userId || id,
            docUrl: pendingDelete.docUrl,
            type: "otherDocument",
          }).unwrap();
          setExistingOtherDocuments((prev) =>
            prev.filter((doc) => doc !== pendingDelete.docUrl)
          );
          setSnackbar({
            open: true,
            message: "Document deleted successfully!",
            severity: "success",
          });
        } else {
          // Remove from local state (newly added, not uploaded yet)
          removeOtherDocument(pendingDelete.idx);
        }
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err?.data?.message ||
          err?.data?.responseMessage ||
          "Document delete failed",
        severity: "error",
      });
    }
    setPendingDelete({ idx: null, fileOrDoc: null, type: null, docUrl: null });
  };

  if (userLoading) {
    return (
      <LoaderContainer>
        <CustomLoader />
      </LoaderContainer>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        sx={{ zIndex: 9999 }}
        disablePortal={false}
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
        {/* Back Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaUserEdit size={20} color="var(--textColor)" />
            <Typography
              variant="h6"
              sx={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#1f2937",
              }}
            >
              Edit Employee Profile
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

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* --- Personal Information Fields --- */}
          <Typography
            variant="h6"
            sx={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#374151",
              mb: 2,
              letterSpacing: 0.2,
              textTransform: "none",
            }}
          >
            Personal Information
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
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
                      backgroundColor: "var(--backgroundColor, #2563eb)",
                      color: "var(--textColor, #374151)",
                      width: 35,
                      height: 35,
                      borderRadius: "50%",
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
                )}
              </Grid>
            ))}
          </Grid>

          {/* --- Bank Details Fields --- */}
          <Typography
            variant="h6"
            sx={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#374151",
              mb: 2,
              letterSpacing: 0.2,
              textTransform: "none",
            }}
          >
            Bank Details
          </Typography>

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

            {/* Cheque Image */}
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
                    borderColor: "var(--textColor, #374151)",
                    backgroundColor: "rgba(59, 130, 246, 0.05)",
                  },
                }}
              >
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
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ mt: 1, borderRadius: "8px", textTransform: "none" }}
                >
                  Select Cheque File
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleChequeImageChange}
                  />
                </Button>
              </Box>

              {chequeImagePreview && (
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "120px",
                      maxHeight: "120px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid #e0e0e0",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#fafafa",
                      position: "relative",
                    }}
                    onClick={() => {
                      setPreviewSrc(chequeImagePreview);
                      setPreviewOpen(true);
                    }}
                  >
                    <img
                      src={chequeImagePreview}
                      alt="Cheque Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {/* Delete button */}
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "#e0e0e0",
                        color: "#333",
                        borderRadius: "50%",
                        boxShadow: 1,
                        zIndex: 10,
                        "&:hover": { bgcolor: "#bdbdbd" },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(
                          null,
                          null,
                          "chequeImage",
                          chequeImagePreview
                        );
                      }}
                    >
                      <X size={16} />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Grid>

            {/* Other Documents */}
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
                    {formData.otherDocuments.map((file, index) => {
                      const isImage = file.type?.startsWith("image");
                      const isPDF = file.type === "application/pdf";
                      const previewUrl = URL.createObjectURL(file);

                      return isImage ? (
                        <Box
                          key={index}
                          sx={{
                            maxWidth: "80px",
                            maxHeight: "80px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "1px solid #e0e0e0",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#fafafa",
                            position: "relative",
                          }}
                          onClick={() => {
                            setPreviewSrc(previewUrl);
                            setPreviewOpen(true);
                          }}
                        >
                          <img
                            src={previewUrl}
                            alt={file.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              bgcolor: "#e0e0e0",
                              color: "#333",
                              borderRadius: "50%",
                              boxShadow: 1,
                              zIndex: 10,
                              "&:hover": { bgcolor: "#bdbdbd" },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeOtherDocument(index);
                            }}
                          >
                            <X size={16} />
                          </IconButton>
                        </Box>
                      ) : (
                        <Chip
                          key={index}
                          label={file.name}
                          variant="outlined"
                          size="small"
                          sx={{
                            maxWidth: "180px",
                            height: "32px",
                            fontSize: "12px",
                            borderColor: "#3b82f6",
                            color: "#374151",
                            backgroundColor: "rgba(59, 130, 246, 0.08)",
                            borderRadius: "12px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setPreviewSrc(previewUrl);
                            setPreviewOpen(true);
                          }}
                          onDelete={() => removeOtherDocument(index)}
                          deleteIcon={<X size={14} />}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

              {existingOtherDocuments.length > 0 && (
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
                    Existing Documents ({existingOtherDocuments.length}):
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
                    {existingOtherDocuments.map((docUrl, index) => {
                      const isImage = /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(
                        docUrl
                      );
                      return isImage ? (
                        <Box
                          key={index}
                          sx={{
                            maxWidth: "80px",
                            maxHeight: "80px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "1px solid #e0e0e0",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#fafafa",
                            position: "relative",
                          }}
                          onClick={() => {
                            setPreviewSrc(docUrl);
                            setPreviewOpen(true);
                          }}
                        >
                          <img
                            src={docUrl}
                            alt={`Document ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                          {/* Delete button */}
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              bgcolor: "#e0e0e0",
                              color: "#333",
                              borderRadius: "50%",
                              boxShadow: 1,
                              zIndex: 10,
                              "&:hover": { bgcolor: "#bdbdbd" },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(
                                index,
                                null,
                                "otherDocument",
                                docUrl
                              );
                            }}
                          >
                            <X size={16} />
                          </IconButton>
                        </Box>
                      ) : (
                        <Chip
                          key={index}
                          label={docUrl.split("/").pop()}
                          variant="outlined"
                          size="small"
                          sx={{
                            maxWidth: "180px",
                            height: "32px",
                            fontSize: "12px",
                            borderColor: "var(--textFieldBorderColor, #ced4da)",
                            color: "#374151",
                            backgroundColor: "rgba(59, 130, 246, 0.08)",
                            borderRadius: "12px",
                            opacity: 0.7,
                            position: "relative",
                          }}
                          onDelete={() =>
                            handleDeleteClick(
                              index,
                              null,
                              "otherDocument",
                              docUrl
                            )
                          }
                          deleteIcon={<X size={14} />}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>

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
                "Update Profile"
              )}
            </Button>
          </Box>
        </Box>
      </Paper>

      <PreviewImg
        previewOpen={previewOpen}
        setPreviewOpen={setPreviewOpen}
        previewSrc={previewSrc}
      />

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="confirm-delete-dialog-title"
      >
        <DialogTitle id="confirm-delete-dialog-title">
          Delete Document
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this document? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            color="secondary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditProfile;
