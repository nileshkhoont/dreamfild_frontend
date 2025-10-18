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
    IconButton
} from '@mui/material';
import { LoaderCircle } from 'lucide-react';
import { useAddOrganizationMutation, useGetAllFeaturesQuery } from '../../API/organization';
import "../../App.css";
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { X } from 'lucide-react';
import { Upload } from 'lucide-react';

const AddOrgForm = ({ onSuccess, open = true }) => {
    const { data: featureData } = useGetAllFeaturesQuery();
    console.log(featureData);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        industry: '',
        organizationType: '',
        registrationNumber: '',
        phoneNumber: '',
        isTrial: false,
        adminName: '',
        adminEmail: '',
        adminPassword: '',
    });

    // Change to track feature IDs instead of names
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [addOrganization, { isLoading }] = useAddOrganizationMutation();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [formErrors, setFormErrors] = useState({});

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        if (featureData?.responseData) {
            // By default, select all feature IDs instead of names
            const allFeatureIds = featureData.responseData.map((feature) => feature._id);
            setSelectedFeatures(allFeatureIds);
        }
    }, [featureData]);

    const orgFields = [
        { name: 'name', label: 'Organization Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'text', required: false },
        { name: 'industry', label: 'Industry', type: 'text', required: false },
        { name: 'organizationType', label: 'Organization Type', type: 'text', required: false },
        { name: 'registrationNumber', label: 'Registration Number', type: 'text', required: true },
        { name: 'phoneNumber', label: 'Phone Number', type: 'text', required: false },
    ];

    const adminFields = [
        { name: 'adminName', label: 'Admin Name', type: 'text', required: true },
        { name: 'adminEmail', label: 'Admin Email', type: 'email', required: true },
        { name: 'adminPassword', label: 'Admin Password', type: 'password', required: true },
    ];

    useEffect(() => {
        if (logoFile) {
            const objectUrl = URL.createObjectURL(logoFile);
            setLogoPreview(objectUrl);

            // Free memory when component unmounts or logoFile changes
            return () => {
                URL.revokeObjectURL(objectUrl);
            };
        }
    }, [logoFile]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'phoneNumber') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData((prev) => ({
                ...prev,
                [name]: numericValue,
            }));
        } else if (name === 'registrationNumber') {
            const numericValue = value.replace(/\D/g, '').slice(0, 12);
            setFormData((prev) => ({
                ...prev,
                [name]: numericValue,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
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

    // Update to handle feature ID selection
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
        console.log('Form submitted');

        const errors = {};
        [...orgFields, ...adminFields].forEach((field) => {
            if (field.required && !formData[field.name]) {
                errors[field.name] = `${field.label} is required`;
            }
        });

        if (selectedFeatures.length === 0) {
            errors.features = 'At least one feature must be selected';
        }

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            console.log('Validation errors:', errors);
            return;
        }

        try {
            const formDataToSend = new FormData();
            
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

            const res = await addOrganization(formDataToSend).unwrap();

            setSnackbar({
                open: true,
                message: res?.responseMessage || res?.message || 'Organization created successfully!',
                severity: 'success',
            });

            if (onSuccess) {
                setTimeout(onSuccess, 1200);
            }

            // Reset form
            setFormData({
                name: '',
                description: '',
                industry: '',
                organizationType: '',
                registrationNumber: '',
                phoneNumber: '',
                isTrial: false,
                adminName: '',
                adminEmail: '',
                adminPassword: '',
            });
            setSelectedFeatures([]);
            setFormErrors({});

            // Reset logo states in the form reset
            setLogoFile(null);
            setLogoPreview(null);
        } catch (err) {
            console.error('API Error:', err);

            setSnackbar({
                open: true,
                message: err?.data?.responseMessage || err?.data?.message || 'Failed to create organization',
                severity: 'error',
            });

            if (err?.data?.errors && typeof err.data.errors === 'object') {
                setFormErrors(err.data.errors);
            }
        }
    };

    return (
        <>
            <Snackbar
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
                                    Add Organization
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
                                                'Add Organization'
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

export default AddOrgForm;