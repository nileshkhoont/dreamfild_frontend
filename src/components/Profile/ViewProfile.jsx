import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Grid,
  Avatar,
  Snackbar,
  Alert,
  Chip,
  Container,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { User } from "lucide-react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useParams, useNavigate } from "react-router-dom";
import { useViewProfileMutation } from "../../apiService";
import { CustomLoader, LoaderContainer } from "../Layout/CustomLoader"; // <-- import here
import "../../App.css";
import PreviewImg from "./PreviewImg"; // Add this import if not already present

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
  { name: "password", label: "Password", type: "password" },
];

const bankDetailsFields = [
  { name: "accountHolderName", label: "Account Holder Name", type: "text" },
  { name: "accountNumber", label: "Account Number", type: "text" },
  { name: "ifscCode", label: "IFSC Code", type: "text" },
  { name: "branchName", label: "Branch Name", type: "text" },
];

const ViewProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viewProfile, { isLoading }] = useViewProfileMutation();
  const [profileData, setProfileData] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await viewProfile({ userId: id }).unwrap();
        setProfileData(res.data);
        if (res.data.profilePhoto) {
          setProfilePhotoPreview(res.data.profilePhoto);
        }
      } catch (err) {
        setSnackbar({
          open: true,
          message:
            err?.data?.message ||
            err?.data?.responseMessage ||
            "Failed to load profile",
          severity: "error",
        });
      }
    };
    if (id) fetchProfile();
  }, [id, viewProfile]);

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${import.meta.env.VITE_BACKEND_URL}/${url}`;
  };

  // Add this helper function above your component
  const displayDate = (dateStr) => {
    if (!dateStr) return "";
    // Handle DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr.replace(/-/g, "/");
    // Handle YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    }
    // Handle DDMMYYYY
    if (dateStr.length === 8) {
      const day = dateStr.substring(0, 2);
      const month = dateStr.substring(2, 4);
      const year = dateStr.substring(4, 8);
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

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
          "&::-webkit-scrollbar": { width: "12px" },
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
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <User size={24} color="var(--textColor, #374151)" />
            <Typography
              variant="h6"
              sx={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}
            >
              View Profile
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
        {/* Content */}
        {isLoading || !profileData ? (
          <LoaderContainer>
            <CustomLoader />
          </LoaderContainer>
        ) : (
          <Box>
            {/* Personal Information Section */}
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
              {/* Profile Photo */}
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
                          src={getImageUrl(profilePhotoPreview)}
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
                  </Box>
                  <Typography variant="body2" color="#6b7280">
                    Profile photo
                  </Typography>
                </Box>
              </Grid>
              {/* Personal Info Fields */}
              {personalInfoFields.map(
                ({ name, label, type, select, options }) => (
                  <Grid item xs={12} md={6} key={name}>
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
                      {label}
                    </Typography>
                    {name === "bloodGroup" ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={
                          bloodGroupOptions.find(
                            (opt) => opt.value === profileData[name]
                          )?.label ||
                          profileData[name] ||
                          ""
                        }
                        name={name}
                        InputProps={{ readOnly: true }}
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
                        InputLabelProps={{
                          shrink: true,
                          disableAnimation: true,
                        }}
                      />
                    ) : select ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={profileData[name] || ""}
                        name={name}
                        InputProps={{ readOnly: true }}
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
                        InputLabelProps={{
                          shrink: true,
                          disableAnimation: true,
                        }}
                      />
                    ) : name === "password" ? (
                      <TextField
                        fullWidth
                        size="small"
                        type={showPassword ? "text" : "password"}
                        name={name}
                        value={profileData[name] || ""}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={
                                  showPassword ? "Hide password" : "Show password"
                                }
                                onClick={() => setShowPassword((show) => !show)}
                                edge="end"
                                tabIndex={-1}
                                sx={{ color: "#9ca3af" }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
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
                        InputLabelProps={{
                          shrink: true,
                          disableAnimation: true,
                        }}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        type={type === "date" ? "text" : type}
                        name={name}
                        value={
                          type === "date"
                            ? displayDate(profileData[name]) || ""
                            : profileData[name] || ""
                        }
                        InputProps={{ readOnly: true }}
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
                        InputLabelProps={{
                          shrink: true,
                          disableAnimation: true,
                        }}
                      />
                    )}
                  </Grid>
                )
              )}
            </Grid>
            {/* Bank Details Section */}
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
              {bankDetailsFields.map(({ name, label, type }) => (
                <Grid item xs={12} md={6} key={name}>
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
                    {label}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={type}
                    name={name}
                    value={profileData.bankDetails?.[name] || ""}
                    InputProps={{ readOnly: true }}
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
                    InputLabelProps={{ shrink: true, disableAnimation: true }}
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
                  {profileData.bankDetails?.chequeImage ? (
                    <Box sx={{ width: "100%" }}>
                      <img
                        src={profileData.bankDetails.chequeImage}
                        alt="Cheque preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setPreviewSrc(profileData.bankDetails.chequeImage);
                          setPreviewOpen(true);
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#374151",
                          mt: 1,
                          fontSize: "14px",
                          fontWeight: 500,
                        }}
                      >
                        No Cheque Image
                      </Typography>
                    </Box>
                  )}
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
                    borderRadius: "12px",
                    p: 2,
                    textAlign: "center",
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
                >
                  {profileData.bankDetails?.otherDocuments &&
                  profileData.bankDetails.otherDocuments.length > 0 ? (
                    <Box sx={{ width: "100%" }}>
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
                        Documents (
                        {profileData.bankDetails.otherDocuments.length}):
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
                        {profileData.bankDetails.otherDocuments.map((docUrl, index) => {
                          // Check if the file is an image
                          const isImage = /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(docUrl);
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
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#8e8e8e",
                        fontSize: "12px",
                        display: "block",
                        mt: 0.5,
                      }}
                    >
                      No documents uploaded.
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      {/* PreviewImg Modal */}
      <PreviewImg
        previewOpen={previewOpen}
        setPreviewOpen={setPreviewOpen}
        previewSrc={previewSrc}
      />
    </Container>
  );
};

export default ViewProfile;
