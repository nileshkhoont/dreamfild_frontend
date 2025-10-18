import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Grid,
    Container,
    Snackbar,
    Alert,
    Checkbox,
    FormControlLabel,
    IconButton,
} from '@mui/material';
import { LoaderCircle, X, Upload } from 'lucide-react';
import { useEditOrganizationMutation, useGetAllFeaturesQuery } from '../../API/organization';
import "../../App.css"
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

const ViewOrgDetails = ({ org, onSuccess, open = true }) => {
    const { data: featureData } = useGetAllFeaturesQuery(); // Fetch features
    
    // Initialize with org's feature IDs instead of names
    const [selectedFeatures, setSelectedFeatures] = useState(
        org?.features?.map(feature => typeof feature === 'object' ? feature._id : feature) || []
    );

    const [formData, setFormData] = useState({
        name: org?.name || '',
        description: org?.description || '',
        industry: org?.industry || '',
        organizationType: org?.organizationType || '',
        registrationNumber: org?.registrationNumber || '',
        phoneNumber: org?.phoneNumber || '',
        isTrial: org?.isTrial || false,
        adminName: org?.admin?.name || '',
        adminEmail: org?.admin?.email || '',
        adminPassword: '',
    });

    const [editOrganization, { isLoading }] = useEditOrganizationMutation();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [snackbarKey, setSnackbarKey] = useState(0); // Add a key for Snackbar
    const [formErrors, setFormErrors] = useState({});
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(org?.logo || null);

    // Update selectedFeatures when org changes (for example, after API refresh)
    useEffect(() => {
        if (org?.features) {
            setSelectedFeatures(
                org.features.map(feature => typeof feature === 'object' ? feature._id : feature)
            );
        }
    }, [org]);

    const orgFields = [
        { name: 'name', label: 'Organization Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'text', required: false },
        { name: 'industry', label: 'Industry', type: 'text', required: false },
        { name: 'organizationType', label: 'Organization Type', type: 'text', required: false },
        { name: 'registrationNumber', label: 'Registration Number', type: 'text', required: false },
        { name: 'phoneNumber', label: 'Phone Number', type: 'text', required: false },
    ];

    const adminFields = [
        { name: 'adminName', label: 'Admin Name', type: 'text', required: false },
        { name: 'adminEmail', label: 'Admin Email', type: 'email', required: false },
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'phoneNumber') {
            // Only allow numbers and max 10 digits for phone
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData((prev) => ({
                ...prev,
                [name]: numericValue,
            }));
        } else if (name === 'registrationNumber') {
            // Only allow numbers and limit to 12 digits for registration number
            const numericValue = value.replace(/\D/g, '').slice(0, 12);
            setFormData((prev) => ({
                ...prev,
                [name]: numericValue,
            }));
        } else if (name === 'email') {
            // Allow uppercase input, but restrict to valid email characters
            const filtered = value.replace(/[^a-zA-Z0-9@._-]/g, '');
            setFormData((prev) => ({
                ...prev,
                [name]: filtered,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }

        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Updated to handle feature IDs instead of names
    const handleFeatureChange = (featureId) => {
        setSelectedFeatures((prev) =>
            prev.includes(featureId)
                ? prev.filter((id) => id !== featureId)
                : [...prev, featureId]
        );
    };

    const handleLogoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file type
            if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
                setSnackbar({
                    open: true,
                    message: 'Please upload an image file (JPEG, JPG, PNG, GIF)',
                    severity: 'error',
                });
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setSnackbar({
                    open: true,
                    message: 'File size should not exceed 5MB',
                    severity: 'error',
                });
                return;
            }

            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("handleSubmit called");
        
        // Frontend validation for required fields
        const errors = {};
        orgFields.forEach((field) => {
            if (field.required && !formData[field.name]) {
                errors[field.name] = `${field.label} is required`;
            }
        });

        // Validate that at least one feature is selected
        if (selectedFeatures.length === 0) {
            errors.features = "At least one feature must be selected";
        }
        
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            const formDataToSend = new FormData();
            
            // Append organization ID
            formDataToSend.append('organizationId', org._id);
            
            // Append all form fields
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            // Append features array
            selectedFeatures.forEach(featureId => {
                formDataToSend.append('features', featureId);
            });

            // Append logo if exists
            if (logoFile) {
                formDataToSend.append('logo', logoFile);
            }

            const res = await editOrganization(formDataToSend).unwrap();
            
            console.log("setSnackbar called (success)", res);
            setSnackbar({
                open: true,
                message: res?.responseMessage || res?.message || res?.responseData?.message || 'Organization updated successfully!',
                severity: 'success'
            });
            setSnackbarKey(prev => prev + 1); // Update key to force Snackbar to re-render
            
            // Delay onSuccess to allow Snackbar to show
            if (onSuccess) setTimeout(onSuccess, 1200);
        } catch (err) {
            console.log("setSnackbar called (error)", err);
            setSnackbar({
                open: true,
                message: err?.data?.responseMessage || err?.data?.message || 'Failed to update organization',
                severity: 'error'
            });
            setSnackbarKey(prev => prev + 1); // Update key to force Snackbar to re-render
            if (err?.data?.errors && typeof err.data.errors === 'object') {
                setFormErrors(err.data.errors);
            }
        }
    };

    return (
        <>
            <Snackbar
                key={snackbarKey}
                open={snackbar.open}
                autoHideDuration={4000}
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

            {open && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1300,
                        padding: 2,
                    }}
                    onClick={(e) => {
                        // Close modal when clicking outside
                        if (e.target === e.currentTarget && onSuccess) {
                            onSuccess();
                        }
                    }}
                >
                    <Paper
                        elevation={24}
                        sx={{
                            backgroundColor: "white",
                            width: "100%",
                            maxWidth: "1100px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            p: 4,
                            borderRadius: 3,
                            position: "relative",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
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
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#bdbdbd transparent',
                        }}
                        onClick={(e) => e.stopPropagation()}
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
                                <BusinessOutlinedIcon sx={{ color: 'var(--textColor, #374151)', fontSize: 24 }} />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontSize: "20px",
                                        fontWeight: 600,
                                        color: "#1f2937",
                                    }}
                                >
                                    Edit Organization
                                </Typography>
                            </Box>
                            <IconButton
                                onClick={() => onSuccess && onSuccess()}
                                sx={{
                                    color: "#6b7280",
                                    "&:hover": {
                                        color: "#000",
                                        backgroundColor: "transparent",
                                    },
                                }}
                            >
                                <X size={24} />
                            </IconButton>
                        </Box>

                        <Container maxWidth="900px">
                            <Paper elevation={0} sx={{ p: 0, borderRadius: 3, boxShadow: 'none' }}>
                                <Box component="form" onSubmit={handleSubmit} noValidate>
                                    <Grid container spacing={3}>
                                       
                                        {/* Organization Fields */}
                                        {orgFields.map(({ name, label, type, required }) => (
                                            <Grid item xs={12} sm={6} key={name}>
                                                <Box mb={1}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            color: formErrors[name] ? 'var(--redShadeColor)' : '#374151',
                                                            fontWeight: 500,
                                                            fontSize: '14px',
                                                            mb: 0.5,
                                                            textAlign: 'left',
                                                            width: '100%',
                                                        }}
                                                    >
                                                        {label}
                                                        {required && (
                                                            <span style={{ color: 'var(--redShadeColor)', marginLeft: 2 }}>*</span>
                                                        )}
                                                    </Typography>
                                                    <TextField
                                                        className="custom-textfield"
                                                        fullWidth
                                                        placeholder={label}
                                                        name={name}
                                                        type={type}
                                                        value={formData[name]}
                                                        onChange={handleChange}
                                                        required={required}
                                                        error={!!formErrors[name]}
                                                        size="small"
                                                        InputLabelProps={{ shrink: true, disableAnimation: true }}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                fontSize: '14px',
                                                                borderRadius: '12px',
                                                                color: '#374151',
                                                                height: '40px',
                                                            },
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: formErrors[name] ? 'var(--redShadeColor)' : 'var(--textFieldBorderColor, #ced4da)',
                                                                borderRadius: '12px',
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: formErrors[name] ? 'var(--redShadeColor)' : 'var(--textFieldBorderColor, #ced4da)',
                                                            },
                                                            '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: formErrors[name] ? 'var(--redShadeColor)' : 'var(--textFieldBorderColor, #ced4da)',
                                                            },
                                                            '& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: formErrors[name] ? 'var(--redShadeColor)' : 'var(--textFieldFocusBorderColor, #343a40)',
                                                                borderWidth: 1,
                                                            },
                                                            '& .MuiInputLabel-root': {
                                                                color: formErrors[name] ? 'var(--redShadeColor)' : '#374151',
                                                                transition: 'none',
                                                            },
                                                            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: 'var(--redShadeColor)',
                                                                borderWidth: 1,
                                                            },
                                                            boxShadow: 'none',
                                                            outline: 'none',
                                                        }}
                                                    />
                                                </Box>
                                            </Grid>
                                        ))}

                                        {/* Logo Upload Section */}
                                        <Grid item xs={12}>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        color: '#374151',
                                                        fontWeight: 500,
                                                        fontSize: '14px',
                                                        mb: 1,
                                                    }}
                                                >
                                                    Organization Logo
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                    }}
                                                >
                                                    {logoPreview ? (
                                                        <Box
                                                            sx={{
                                                                position: 'relative',
                                                                width: 100,
                                                                height: 100,
                                                            }}
                                                        >
                                                            <img
                                                                src={logoPreview}
                                                                alt="Logo preview"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '8px',
                                                                }}
                                                            />
                                                            <IconButton
                                                                onClick={handleRemoveLogo}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: -8,
                                                                    right: -8,
                                                                    backgroundColor: 'white',
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                    '&:hover': {
                                                                        backgroundColor: '#f3f4f6',
                                                                    },
                                                                }}
                                                                size="small"
                                                            >
                                                                <X size={16} />
                                                            </IconButton>
                                                        </Box>
                                                    ) : (
                                                        <Button
                                                            component="label"
                                                            variant="outlined"
                                                            startIcon={<Upload size={20} />}
                                                            sx={{
                                                                borderColor: 'var(--textFieldBorderColor)',
                                                                color: '#374151',
                                                                '&:hover': {
                                                                    borderColor: 'var(--textFieldFocusBorderColor)',
                                                                    backgroundColor: 'transparent',
                                                                },
                                                            }}
                                                        >
                                                            Upload Logo
                                                            <input
                                                                type="file"
                                                                hidden
                                                                accept="image/*"
                                                                onChange={handleLogoChange}
                                                            />
                                                        </Button>
                                                    )}
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: '#6b7280',
                                                            fontSize: '12px',
                                                        }}
                                                    >
                                                        Max file size: 5MB. Supported formats: JPEG, JPG, PNG, GIF
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        {/* Features Section */}
                                        <Grid item xs={12}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: '#374151',
                                                    fontWeight: 600,
                                                    fontSize: '20px',
                                                    mt: 2,
                                                    mb: 1,
                                                    textAlign: 'left',
                                                }}
                                            >
                                                Features
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {featureData?.responseData?.map((feature) => (
                                                    <FormControlLabel
                                                        key={feature._id}
                                                        control={
                                                            <Checkbox
                                                                checked={selectedFeatures.includes(feature._id)}
                                                                onChange={() => handleFeatureChange(feature._id)}
                                                                name={feature._id}
                                                                sx={{
                                                                    color: 'var(--purpleShadeBg)',
                                                                    '&.Mui-checked': {
                                                                        color: 'var(--purpleShadeBg)',
                                                                    },
                                                                }}
                                                            />
                                                        }
                                                        label={
                                                            <Typography
                                                                sx={{
                                                                    color: '#374151',
                                                                    fontSize: '14px',
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                {feature.name}
                                                            </Typography>
                                                        }
                                                    />
                                                ))}
                                            </Box>
                                            {formErrors.features && (
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        color: 'var(--redShadeColor)',
                                                        fontWeight: 500,
                                                        fontSize: '14px',
                                                        mt: 1,
                                                    }}
                                                >
                                                    {formErrors.features}
                                                </Typography>
                                            )}
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={formData.isTrial}
                                                        onChange={handleChange}
                                                        name="isTrial"
                                                        sx={{
                                                            color: 'var(--purpleShadeBg)',
                                                            '&.Mui-checked': {
                                                                color: 'var(--purpleShadeBg)',
                                                            },
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Typography
                                                        sx={{
                                                            color: '#374151',
                                                            fontSize: '14px',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        Is Trial?
                                                    </Typography>
                                                }
                                            />
                                        </Grid>

                                        {/* Admin Details Section */}
                                        <Grid item xs={12}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: '#374151',
                                                    fontWeight: 600,
                                                    fontSize: '20px',
                                                    mt: 2,
                                                    mb: 1,
                                                    textAlign: 'left',
                                                }}
                                            >
                                                Admin Details
                                            </Typography>
                                        </Grid>

                                        {/* Admin Fields */}
                                        {adminFields.map(({ name, label, type, required }) => (
                                            <Grid item xs={12} sm={6} key={name}>
                                                <Box mb={1}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            color: formErrors[name] ? 'var(--redShadeColor)' : '#374151',
                                                            fontWeight: 500,
                                                            fontSize: '14px',
                                                            mb: 0.5,
                                                            textAlign: 'left',
                                                            width: '100%',
                                                        }}
                                                    >
                                                        {label}
                                                        {required && (
                                                            <span style={{ color: 'var(--redShadeColor)', marginLeft: 2 }}>*</span>
                                                        )}
                                                    </Typography>
                                                    <TextField
                                                        className="custom-textfield"
                                                        fullWidth
                                                        placeholder={label}
                                                        name={name}
                                                        type={type}
                                                        value={formData[name]}
                                                        onChange={handleChange}
                                                        required={required}
                                                        error={!!formErrors[name]}
                                                        size="small"
                                                        InputLabelProps={{ shrink: true, disableAnimation: true }}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                fontSize: '14px',
                                                                borderRadius: '12px',
                                                                color: '#374151',
                                                                height: '40px',
                                                            },
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: formErrors[name] ? 'var(--redShadeColor)' : 'var(--textFieldBorderColor, #ced4da)',
                                                                borderRadius: '12px',
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: formErrors[name] ? 'var(--redShadeColor)' : 'var(--textFieldBorderColor, #ced4da)',
                                                            },
                                                            '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: formErrors[name] ? 'var(--redShadeColor)' : 'var(--textFieldBorderColor, #ced4da)',
                                                            },
                                                            '& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: formErrors[name] ? 'var(--redShadeColor)' : 'var(--textFieldFocusBorderColor, #343a40)',
                                                                borderWidth: 1,
                                                            },
                                                            '& .MuiInputLabel-root': {
                                                                color: formErrors[name] ? 'var(--redShadeColor)' : '#374151',
                                                                transition: 'none',
                                                            },
                                                            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: 'var(--redShadeColor)',
                                                                borderWidth: 1,
                                                            },
                                                            boxShadow: 'none',
                                                            outline: 'none',
                                                        }}
                                                    />
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    <Box display="flex" justifyContent="flex-start" mt={3}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            sx={{
                                                backgroundColor: 'var(--purpleShadeBg)',
                                                color: 'white',
                                                borderRadius: '12px',
                                                fontWeight: 500,
                                                fontSize: '14px',
                                                textTransform: 'none',
                                                px: 3,
                                                py: 1,
                                                height: '40px',
                                                minWidth: '120px',
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    backgroundColor: 'var(--purpleShadeBg)',
                                                    boxShadow: 'none',
                                                },
                                            }}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <LoaderCircle size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                                    <style>{`
                                                        @keyframes spin {
                                                            0% { transform: rotate(0deg); }
                                                            100% { transform: rotate(360deg); }
                                                        }
                                                    `}</style>
                                                </span>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        </Container>
                    </Paper>
                </Box>
            )}
        </>
    );
};

export default ViewOrgDetails;