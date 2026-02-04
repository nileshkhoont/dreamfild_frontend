import React, { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Grid,
  Container,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  User,
  Upload,
  Camera,
  FileText,
  CreditCard,
  Building2,
  X as CloseIcon,
} from "lucide-react";
import {
  useViewLoggedinUserProfileQuery,
  useEditLoggedinUserProfileMutation,
} from "../../apiService";
import IconButton from "@mui/material/IconButton";
import { CustomLoader, LoaderContainer } from "../Layout/CustomLoader";
import "../../App.css";
import { useDeleteUserDocumentMutation } from "../../apiService";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import PreviewImg from "./PreviewImg"; // adjust path if needed
import { useAuth } from "../../utils/AuthContext"; // Add this import

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
  { name: "name", label: "Full Name", type: "text", icon: User },
  { name: "email", label: "Email Address", type: "email", icon: User },
  { name: "phone", label: "Phone Number", type: "text", icon: User },
  { name: "designation", label: "Job Title", type: "text", icon: Building2 },
  { name: "dateOfBirth", label: "Date of Birth", type: "date", icon: User },
  {
    name: "dateOfJoining",
    label: "Joining Date",
    type: "date",
    icon: Building2,
  },
  {
    name: "emergencyContactNumber",
    label: "Emergency Contact",
    type: "text",
    icon: User,
  },
  {
    name: "bloodGroup",
    label: "Blood Group",
    type: "select",
    select: true,
    options: bloodGroupOptions,
    icon: User,
  },
];

const bankDetailsFields = [
  { name: "accountHolderName", label: "Account Holder Name", type: "text" },
  { name: "accountNumber", label: "Account Number", type: "text" },
  { name: "ifscCode", label: "IFSC Code", type: "text" },
  { name: "branchName", label: "Branch Name", type: "text" },
];

// Helper to get correct image URL
const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${import.meta.env.VITE_BACKEND_URL}/${url}`;
};

// Add this helper above your component:
const toInputDateFormat = (dateStr) => {
  if (!dateStr) return "";
  // If already yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // If dd-mm-yyyy
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [dd, mm, yyyy] = dateStr.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }
  // If ddmmyyyy
  if (/^\d{8}$/.test(dateStr)) {
    return `${dateStr.slice(4)}-${dateStr.slice(2, 4)}-${dateStr.slice(0, 2)}`;
  }
  // Try to parse ISO or other formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return "";
};

const ParticularUserProfile = () => {
  const {
    data: userProfile,
    isLoading,
    error,
    refetch,
  } = useViewLoggedinUserProfileQuery();
  const [editProfile, { isLoading: isEditing }] =
    useEditLoggedinUserProfileMutation();
  const { updateUser, user } = useAuth(); // Get updateUser from context

  const [editMode, setEditMode] = useState(false);
  const [formState, setFormState] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [chequeImage, setChequeImage] = useState(null);
  const [otherDocuments, setOtherDocuments] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState({
    idx: null,
    fileOrDoc: null,
    type: null, // <-- add type
    docUrl: null, // <-- add docUrl
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");

  const [deleteUserDocument] = useDeleteUserDocumentMutation();

  const handleDeleteDocument = async (docUrl, type) => {
    try {
      const userId = profileData?._id || formState?._id;
      await deleteUserDocument({ userId, docUrl, type }).unwrap();
      setSnackbar({
        open: true,
        message: "Document deleted successfully!",
        severity: "success",
      });

      // Remove from local state as needed...
      if (type === "profilePhoto") {
        setFormState((prev) => ({ ...prev, profilePhoto: undefined }));
        // Remove profilePhoto from localStorage user object
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          delete userObj.profilePhoto;
          localStorage.setItem("user", JSON.stringify(userObj));
          updateUser(userObj); // <-- this triggers Navigation to update instantly
        }
        refetch();
      } else if (type === "chequeImage") {
        setFormState((prev) => ({
          ...prev,
          bankDetails: { ...prev.bankDetails, chequeImage: undefined },
        }));
      } else if (type === "otherDocument") {
        setFormState((prev) => ({
          ...prev,
          bankDetails: {
            ...prev.bankDetails,
            otherDocuments: prev.bankDetails?.otherDocuments
              ? prev.bankDetails.otherDocuments.filter((doc) => doc !== docUrl)
              : [],
          },
        }));
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.data?.message || "Error deleting document.",
        severity: "error",
      });
    }
  };

  const [profilePhoto, setProfilePhoto] = useState(null);

  React.useEffect(() => {
    if (userProfile?.responseData) {
      setFormState(userProfile.responseData);
      setChequeImage(null);
      setOtherDocuments([]);
      setProfilePhoto(null);
    }
  }, [userProfile]);

  if (isLoading) {
    return (
      <LoaderContainer>
        <CustomLoader />
      </LoaderContainer>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card sx={{ textAlign: "center", py: 6, borderRadius: 3 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Unable to Load Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please try refreshing the page or contact support.
          </Typography>
        </Card>
      </Container>
    );
  }

  const profileData = userProfile?.responseData;

  if (!profileData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card sx={{ textAlign: "center", py: 6, borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No Profile Data Available
          </Typography>
        </Card>
      </Container>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not specified";
    // If already in dd-mm-yyyy (10 chars, digits and dashes)
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      return dateStr;
    }
    // Try to parse ISO or other formats and convert to dd-mm-yyyy
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    // Try to parse ddmmyyyy (8 digits) and convert to dd-mm-yyyy
    if (/^\d{8}$/.test(dateStr)) {
      return `${dateStr.slice(0, 2)}-${dateStr.slice(2, 4)}-${dateStr.slice(
        4
      )}`;
    }
    return dateStr;
  };

  // Helper to format date as dd-mm-yyyy for backend
  const toDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    // If already in dd-mm-yyyy (10 chars, digits and dashes)
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
    // If in ddmmyyyy (8 digits)
    if (/^\d{8}$/.test(dateStr)) {
      return `${dateStr.slice(0, 2)}-${dateStr.slice(2, 4)}-${dateStr.slice(
        4
      )}`;
    }
    // If in yyyy-mm-dd or ISO
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    return dateStr;
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormState(profileData);
    setChequeImage(null);
    setOtherDocuments([]);
    setProfilePhoto(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Phone and Emergency Contact: only numbers, 10-12 digits
    if (name === "phone" || name === "emergencyContactNumber") {
      const numericValue = value.replace(/\D/g, "").slice(0, 12);
      setFormState((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
      return;
    }
    // Job Title: only characters and spaces
    if (name === "designation") {
      const charValue = value.replace(/[^a-zA-Z\s]/g, "");
      setFormState((prev) => ({
        ...prev,
        [name]: charValue,
      }));
      return;
    }
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle bank details change
  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    // Account Holder Name: only characters and spaces
    if (name === "accountHolderName") {
      const charValue = value.replace(/[^a-zA-Z\s]/g, "");
      setFormState((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [name]: charValue,
        },
      }));
      return;
    }
    // Account Number: only numbers
    if (name === "accountNumber") {
      const numericValue = value.replace(/\D/g, "");
      setFormState((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [name]: numericValue,
        },
      }));
      return;
    }
    // Branch Name: only characters and spaces
    if (name === "branchName") {
      const charValue = value.replace(/[^a-zA-Z\s]/g, "");
      setFormState((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [name]: charValue,
        },
      }));
      return;
    }
    setFormState((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value,
      },
    }));
  };

  // Handle cheque image upload
  const handleChequeImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setChequeImage(e.target.files[0]);
    }
  };

  // Handle other documents upload (multiple)
  const handleOtherDocumentsChange = (e) => {
    if (e.target.files) {
      setOtherDocuments((prevDocs) => [
        ...prevDocs,
        ...Array.from(e.target.files),
      ]);
    }
  };

  const handleProfilePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };
  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setPendingDelete({ idx: null, fileOrDoc: null, type: null, docUrl: null });
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      // Add all personal info fields
      Object.entries(formState).forEach(([key, value]) => {
        if (key !== "bankDetails") {
          // If field is a date, convert to ddmmyyyy
          if (key === "dateOfBirth" || key === "dateOfJoining") {
            formData.append(key, toDDMMYYYY(value));
          } else {
            formData.append(key, value);
          }
        }
      });
      // Add bank details fields (except files)
      if (formState.bankDetails) {
        Object.entries(formState.bankDetails).forEach(([key, value]) => {
          if (key !== "chequeImage" && key !== "otherDocuments") {
            formData.append(`bankDetails.${key}`, value);
          }
        });
      }
      // Add cheque image if changed
      if (chequeImage) {
        formData.append("chequeImage", chequeImage);
      }
      // Add other documents if changed
      if (otherDocuments.length > 0) {
        otherDocuments.forEach((file) => {
          formData.append("otherDocuments", file);
        });
      }
      // Add profile photo if changed
      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto);
      }
      // Add userId (required by backend)
      formData.append("userId", profileData._id);

      const res = await editProfile(formData).unwrap();
      setSnackbar({
        open: true,
        message: res?.message || "Profile updated successfully!",
        severity: "success",
      });
      setEditMode(false);
      // Update local state with new profile data
      if (res?.data) {
        setFormState(res.data);
        setProfilePhoto(null);
        setChequeImage(null);
        setOtherDocuments([]);
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          userObj.profilePhoto = res.data.profilePhoto;
          localStorage.setItem("user", JSON.stringify(userObj));
          updateUser(userObj); // <-- update context
        }
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.data?.message || "Failed to update profile.",
        severity: "error",
      });
    }
  };

  const handleDeleteClick = (
    idx,
    fileOrDoc,
    type = "otherDocument",
    docUrl = null
  ) => {
    setPendingDelete({ idx, fileOrDoc, type, docUrl });
    setConfirmDialogOpen(true);
  };

  // Confirm deletion
  const handleConfirmDelete = () => {
    setConfirmDialogOpen(false);
    if (pendingDelete.type === "profilePhoto") {
      handleDeleteDocument(pendingDelete.docUrl, "profilePhoto");
      setFormState((prev) => ({ ...prev, profilePhoto: undefined }));
    } else if (pendingDelete.type === "chequeImage") {
      handleDeleteDocument(pendingDelete.docUrl, "chequeImage");
      setFormState((prev) => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, chequeImage: undefined },
      }));
    } else if (pendingDelete.type === "otherDocument") {
      if (otherDocuments.length > 0) {
        setOtherDocuments((prev) =>
          prev.filter((_, i) => i !== pendingDelete.idx)
        );
      } else {
        handleDeleteDocument(pendingDelete.docUrl, "otherDocument");
      }
    }
    setPendingDelete({ idx: null, fileOrDoc: null, type: null, docUrl: null });
  };

  return (
    <>
      <Container
        maxWidth={false} // Disable the default maxWidth
        sx={{
          pt: 4,
          px: '0 !important',
        }}
      >
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        <Grid container spacing={4}>
          {/* Profile Header Card */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                background: "linear-gradient(135deg, #232526 0%, #414345 100%)",
                color: "white",
                position: "relative",
                overflow: "hidden",
                minHeight: 140,
                mb: 2,
                px: { xs: 2, sm: 4 },
                boxShadow: "0 2px 16px 0 rgba(114,103,240,0.07)",
                //  backgroundColor: "green"
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  opacity: 0.08,
                }}
              >
                <User size={160} />
              </Box>
              <CardContent
                sx={{ p: { xs: 2, sm: 3 }, position: "relative", zIndex: 1 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ position: "relative", width: 80, height: 80 }}>
                    <Avatar
                      src={
                        profilePhoto
                          ? URL.createObjectURL(profilePhoto)
                          : getImageUrl(formState.profilePhoto)
                      }
                      sx={{
                        width: 80,
                        height: 80,
                        border: "3px solid rgba(255,255,255,0.18)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        cursor: editMode ? "pointer" : "default",
                        transition: "box-shadow 0.2s",
                        position: "relative",
                        bgcolor: "white",
                        color: "var(--purpleShadeBg)",
                      }}
                    >
                      {!profilePhoto && !formState.profilePhoto && (
                        <User size={36} />
                      )}
                    </Avatar>

                    {editMode && (
                      <>
                        {/* If no photo, show camera icon for upload */}
                        {!profilePhoto && !formState.profilePhoto ? (
                          <Button
                            component="label"
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              minWidth: 0,
                              p: 0.7,
                              bgcolor: "white",
                              borderRadius: "50%",
                              boxShadow: 2,
                              zIndex: 2,
                              "&:hover": { bgcolor: "#f0f0f0" },
                            }}
                          >
                            <Camera size={18} color="var(--purpleShadeBg)" />
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={handleProfilePhotoChange}
                            />
                          </Button>
                        ) : (
                          // If photo exists, show cross icon for delete
                          <IconButton
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              bgcolor: "white",
                              borderRadius: "50%",
                              boxShadow: 2,
                              zIndex: 2,
                              p: 0.7,
                              "&:hover": { bgcolor: "#f0f0f0" },
                            }}
                            onClick={() => {
                              if (profilePhoto) {
                                setProfilePhoto(null);
                              } else if (formState.profilePhoto) {
                                handleDeleteClick(
                                  null,
                                  formState.profilePhoto,
                                  "profilePhoto",
                                  formState.profilePhoto
                                );
                              }
                            }}
                          >
                            <CloseIcon size={18} color="var(--purpleShadeBg)" />
                          </IconButton>
                        )}
                      </>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{
                        mb: 0.5,
                        fontSize: { xs: "1.05rem", sm: "1.18rem" },
                        color: "white",
                        lineHeight: 1.2,
                        wordBreak: "break-word",
                      }}
                    >
                      {formState.name || "Unknown User"}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        opacity: 0.92,
                        mb: 0.5,
                        fontSize: { xs: "0.89rem", sm: "0.98rem" },
                        color: "white",
                        fontWeight: 400,
                        lineHeight: 1.2,
                        wordBreak: "break-word",
                      }}
                    >
                      {formState.designation || "No designation specified"}
                    </Typography>
                  </Box>
                  {!editMode && (
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{
                        ml: "auto",
                        backgroundColor: "#fff", // Changed to white
                        color: "var(--purpleShadeBg)", // Text color to match theme
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
                          backgroundColor: "#f3f3fd", // subtle hover for white button
                          boxShadow: "none",
                        },
                      }}
                      onClick={handleEditClick}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Personal Information */}
          <Grid item xs={12}>
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      background: "#ffffff",
      boxShadow: "0 2px 16px 0 rgba(114,103,240,0.07)",
      border: "1px solid #e9ecef",
    }}
  >
    <CardHeader
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <User size={20} color="var(--purpleShadeBg)" />
          <Typography variant="h6" fontWeight={600}>
            Personal Information
          </Typography>
        </Box>
      }
      sx={{ pb: 1 }}
    />
    <Divider />
    <CardContent sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {personalInfoFields.map(({ name, label, type, select, options }) => (
          <Grid item xs={12} sm={6} key={name}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  mb: 1,
                  fontSize: "0.875rem",
                  textAlign: "left",
                }}
              >
                {label}
              </Typography>

              {editMode ? (
                <TextField
                  select={!!select}
                  fullWidth
                  name={name}
                  type={type}
                  value={
                    type === "date"
                      ? toInputDateFormat(formState[name])
                      : formState[name] || ""
                  }
                  onChange={handleChange}
                  size="small"
                  sx={{
                    backgroundColor: "#f1f1f1",
                    borderRadius: "12px",
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      borderRadius: "12px",
                      height: "40px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--textFieldBorderColor, #ced4da)",
                      borderRadius: "12px",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--textFieldBorderColor, #ced4da)",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                      borderWidth: 1,
                    },
                  }}
                >
                  {select &&
                    options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                </TextField>
              ) : (
                <Box
                  sx={{
                    backgroundColor: "#f1f1f1",
                    borderRadius: "12px",
                    p: "10px 12px",
                    border: "1px solid var(--textFieldBorderColor, #ced4da)",
                    minHeight: "40px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "var(--purpleShadeBg)",
                    fontWeight: 500,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: "inherit",
                      fontWeight: 500,
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {type === "date"
                      ? formatDate(formState[name])
                      : formState[name] || "Not specified"}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  </Card>
</Grid>

          {/* Bank Details */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                background: "#ffffff",
                boxShadow: "0 2px 16px 0 rgba(114,103,240,0.07)",
                border: "1px solid #e9ecef",
              }}
            >
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CreditCard size={20} color="var(--purpleShadeBg)" />
                    <Typography variant="h6" fontWeight={600}>
                      Banking Information
                    </Typography>
                  </Box>
                }
                sx={{ pb: 1 }}
              />
              <Divider />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {bankDetailsFields.map(({ name, label }) => (
                    <Grid item xs={12} sm={6} md={3} key={name}>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 500,
                            mb: 1,
                            fontSize: "0.875rem",
                            textAlign: "left",

                          }}
                        >
                          {label}
                        </Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            name={name}
                            value={formState.bankDetails?.[name] || ""}
                            onChange={handleBankDetailsChange}
                            size="small"
                            sx={{
                              backgroundColor: "#f1f1f1", // fix invalid hex
                              borderRadius: "12px", // move radius to root
                              "& .MuiOutlinedInput-root": {
                                fontSize: "14px",
                                height: "40px",
                                borderRadius: "12px", // apply here too
                                padding: 0,
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--textFieldBorderColor, #ced4da)",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--textFieldBorderColor, #ced4da)",
                              },
                              "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                                borderWidth: 1,
                              },
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              bgcolor: "#f1f1f1",
                              borderRadius: "12px",
                              p: 1.2,
                              border:
                                "1px solid var(--textFieldBorderColor, #ced4da)",
                              minHeight: "40px",
                              display: "flex",
                              alignItems: "center",
                              fontSize: "14px",
                              color: "var(--purpleShadeBg)",
                              fontWeight: 500,
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                color: "inherit",
                                fontWeight: 500,
                                fontSize: "14px",
                              }}
                            >
                              {formState.bankDetails?.[name] || "Not specified"}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  ))}
                  {/* Cheque Image Upload */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mb: 1,
                          fontSize: "0.875rem",
                        }}
                      >
                        Bank Cheque
                      </Typography>
                      {editMode &&
                        !chequeImage &&
                        !formState.bankDetails?.chequeImage && (
                          <Button
                            variant="contained"
                            component="label"
                            fullWidth
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
                              mb: 1,
                              boxShadow: "none",
                              "&:hover": {
                                backgroundColor: "var(--purpleShadeBg)",
                                boxShadow: "none",
                              },
                            }}
                          >
                            Upload Cheque Image
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={handleChequeImageChange}
                            />
                          </Button>
                        )}
                      <Box
                        sx={{
                          bgcolor: "#f1f1f1",
                          borderRadius: "12px",
                          p: 1.2,
                          border: "1px solid #ececec",
                          minHeight: "160px",
                          height: "auto",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "start",
                          gap: 2,
                          flexWrap: "wrap",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        {chequeImage ? (
                          chequeImage.type &&
                            chequeImage.type.startsWith("image") ? (
                            <Box sx={{ position: "relative" }}>
                              <img
                                src={URL.createObjectURL(chequeImage)}
                                alt="Bank Cheque"
                                style={{
                                  width: "150px",
                                  height: "150px",
                                  borderRadius: 12,
                                  objectFit: "cover",
                                  cursor: "pointer",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                  border: "1px solid #eee",
                                  display: "block",
                                  margin: "0 auto",
                                }}
                                onClick={() => {
                                  setPreviewSrc(
                                    URL.createObjectURL(chequeImage)
                                  );
                                  setPreviewOpen(true);
                                }}
                              />
                              {editMode && (
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    height: 26,
                                    width: 26,
                                    bgcolor: "#e0e0e0",
                                    color: "#333",
                                    borderRadius: "50%",
                                    boxShadow: 1,
                                    zIndex: 10,
                                    pointerEvents: "auto",
                                    transition:
                                      "opacity 0.2s ease-in-out, background-color 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    "&:hover": {
                                      bgcolor: "#bdbdbd",
                                    },
                                  }}
                                  onClick={() => setChequeImage(null)}
                                >
                                  <CloseIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              )}
                            </Box>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "16px" }}
                            >
                              {chequeImage.name}
                            </Typography>
                          )
                        ) : formState.bankDetails?.chequeImage ? (
                          <Box sx={{ position: "relative" }}>
                            <img
                              src={getImageUrl(
                                formState.bankDetails.chequeImage
                              )}
                              alt="Bank Cheque"
                              style={{
                                width: "150px",
                                height: "150px",
                                borderRadius: 12,
                                objectFit: "cover",
                                cursor: "pointer",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                border: "1px solid #eee",
                                display: "block",
                                margin: "0 auto",
                              }}
                              onClick={() => {
                                setPreviewSrc(
                                  getImageUrl(formState.bankDetails.chequeImage)
                                );
                                setPreviewOpen(true);
                              }}
                            />
                            {editMode && (
                              <IconButton
                                size="small"
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  height: 26,
                                  width: 26,
                                  bgcolor: "#f1f1f1",
                                  color: "#333",
                                  borderRadius: "50%",
                                  boxShadow: 1,
                                  zIndex: 10,
                                  pointerEvents: "auto",
                                  transition:
                                    "opacity 0.2s ease-in-out, background-color 0.2s",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  "&:hover": {
                                    bgcolor: "#bdbdbd",
                                  },
                                }}
                                onClick={() => {
                                  handleDeleteClick(
                                    null,
                                    formState.bankDetails.chequeImage,
                                    "chequeImage",
                                    formState.bankDetails.chequeImage
                                  );
                                }}
                              >
                                <CloseIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            )}
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: "16px",
                              width: "100%",
                              textAlign: "center",
                              py: 4,
                            }}
                          >
                            No cheque image uploaded
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                  {/* Additional Documents - moved below cheque image, flex row, bigger images, no scrollbar */}
                  <Grid item xs={12}>
                    <Box sx={{ mt: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mb: 1,
                          fontSize: "0.875rem",
                        }}
                      >
                        Additional Documents
                      </Typography>

                      {editMode && (
                        <Button
                          variant="contained"
                          component="label"
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
                            mb: 1,
                            boxShadow: "none",
                            "&:hover": {
                              backgroundColor: "var(--purpleShadeBg)",
                              boxShadow: "none",
                            },
                          }}
                        >
                          Upload Documents
                          <input
                            type="file"
                            multiple
                            hidden
                            onChange={handleOtherDocumentsChange}
                          />
                        </Button>
                      )}

                      <Box
                        sx={{
                          bgcolor: "#f1f1f1",
                          borderRadius: "12px",
                          p: 1.2,
                          border: "1px solid #ececec",
                          minHeight: "40px",
                          display: "flex",
                          gap: 2,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                          justifyContent: "start",
                          flexWrap: "wrap",
                          width: "100%",
                          maxWidth: "100%",
                          overflowX: "hidden",
                          mt: 2,
                        }}
                      >
                        {/* Show both newly selected documents AND existing documents */}
                        {[
                          ...otherDocuments,
                          ...(formState.bankDetails?.otherDocuments || []),
                        ].map((fileOrDoc, idx) => {
                          const isFile = fileOrDoc instanceof File; // More reliable check
                          const isImage = isFile
                            ? fileOrDoc.type?.startsWith("image")
                            : /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileOrDoc);
                          const src = isFile
                            ? URL.createObjectURL(fileOrDoc)
                            : getImageUrl(fileOrDoc);
                          const name = isFile
                            ? fileOrDoc.name
                            : fileOrDoc.split("/").pop();

                          return (
                            <Box
                              key={idx}
                              sx={{
                                textAlign: "center",
                                position: "relative",
                                width: "180px",
                                height: "180px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                "&:hover .doc-remove-btn": {
                                  opacity: 1,
                                },
                                transition: "0.3s ease all",
                              }}
                            >
                              {isImage ? (
                                <img
                                  src={src}
                                  alt=""
                                  style={{
                                    width: "170px",
                                    height: "170px",
                                    borderRadius: 12,
                                    objectFit: "cover",
                                    cursor: "pointer",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                    border: "1px solid #eee",
                                  }}
                                  onClick={() => {
                                    setPreviewSrc(src);
                                    setPreviewOpen(true);
                                  }}
                                />
                              ) : (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: "16px",
                                    cursor: "pointer",
                                    wordBreak: "break-all",
                                    bgcolor: "#f5f5f5",
                                    borderRadius: 2,
                                    p: 1,
                                    border: "1px solid #eee",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                    width: "170px",
                                    height: "170px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                  onClick={() => window.open(src, "_blank")}
                                >
                                  {name}
                                </Typography>
                              )}

                              <IconButton
                                className="doc-remove-btn"
                                size="small"
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  height: 26,
                                  width: 26,
                                  bgcolor: "#e0e0e0",
                                  color: "#333",
                                  borderRadius: "50%",
                                  boxShadow: 1,
                                  opacity: 0,
                                  zIndex: 10,
                                  pointerEvents: "auto",
                                  transition:
                                    "opacity 0.2s ease-in-out, background-color 0.2s",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  "&:hover": {
                                    bgcolor: "#bdbdbd",
                                  },
                                }}
                                onClick={() =>
                                  handleDeleteClick(
                                    idx,
                                    fileOrDoc,
                                    "otherDocument",
                                    isFile ? null : fileOrDoc
                                  )
                                }
                              >
                                <CloseIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          );
                        })}

                        {otherDocuments.length === 0 &&
                          (!formState.bankDetails?.otherDocuments ||
                            formState.bankDetails.otherDocuments.length ===
                            0) && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: "16px" }}
                            >
                              No documents uploaded
                            </Typography>
                          )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                {/* Save/Cancel buttons below banking info */}
                {editMode && (
                  <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSave}
                      disabled={isEditing}
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
                    >
                      {isEditing ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleCancelEdit}
                      disabled={isEditing}
                      size="small"
                      sx={{
                        color: "var(--purpleShadeBg)",
                        borderColor: "var(--textFieldBorderColor, #ced4da)",
                        backgroundColor: "transparent",
                        "&:hover": {
                          backgroundColor: "rgba(114, 103, 240, 0.08)",
                          boxShadow: "none",
                          borderColor: "var(--textFieldBorderColor, #ced4da)",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelDelete}
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
            onClick={handleCancelDelete}
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

      <PreviewImg
        previewOpen={previewOpen}
        setPreviewOpen={setPreviewOpen}
        previewSrc={previewSrc}
      />
    </>
  );
};

export default ParticularUserProfile;
