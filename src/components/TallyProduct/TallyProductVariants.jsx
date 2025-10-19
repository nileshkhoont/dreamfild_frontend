import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  Paper,
  styled,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Chip,
  Snackbar,
  Alert,
  InputAdornment,
  Rating,
  Divider,
  List,
  ListItem,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Package,
  Edit2,
  Star,
  MessageSquare,
  User,
  MoreVertical,
  Trash2,
  ArrowLeft,
  Tag,
  DollarSign,
  Plus,
} from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useUpdateTallyProductMutation,
  useGetProductReviewsQuery,
  useAddProductReviewMutation,
  useUpdateProductReviewMutation,
  useDeleteProductReviewMutation,
} from "../../apiService";

const Container = styled(Box)({
  margin: "0 auto",
  paddingTop: "2rem",
  overflow: "hidden",
});

const VariantCard = styled(Paper)(({ theme }) => ({
  padding: "1.5rem",
  borderRadius: "12px",
  border: "1px solid #e0e0e0",
  transition: "all 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    boxShadow: "0 4px 20px rgba(80, 60, 180, 0.1)",
    borderColor: "var(--purpleShadeBg)",
    transform: "translateY(-2px)",
  },
}));

const SpecificationItem = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  marginBottom: "8px",
  padding: "8px 12px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  "&:hover": {
    borderColor: "var(--purpleShadeBg)",
    backgroundColor: "#fafafa",
  },
});

const VideoLink = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "4px 8px",
  backgroundColor: "#f3f4f6",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#e5e7eb",
    transform: "translateX(2px)",
  },
});

const TallyProductVariants = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Add state for productData so we can update it
  const [productData, setProductData] = useState(location.state?.productData);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [addReviewDialogOpen, setAddReviewDialogOpen] = useState(false);
  const [editReviewDialogOpen, setEditReviewDialogOpen] = useState(false);
  const [deleteReviewDialogOpen, setDeleteReviewDialogOpen] = useState(false);
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);
  const [reviewMenuAnchor, setReviewMenuAnchor] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [updateTallyProduct, { isLoading: isUpdating }] =
    useUpdateTallyProductMutation();
  const [addProductReview, { isLoading: isAddingReview }] =
    useAddProductReviewMutation();
  const [updateProductReview, { isLoading: isUpdatingReview }] =
    useUpdateProductReviewMutation();
  const [deleteProductReview, { isLoading: isDeletingReview }] =
    useDeleteProductReviewMutation();

  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    refetch: refetchReviews,
  } = useGetProductReviewsQuery(selectedProduct?.id, {
    skip: !selectedProduct?.id || !reviewDialogOpen,
  });

  const reviews = reviewsData?.data || [];

  if (!productData) {
    return (
      <Container>
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            Product data not found. Please go back to the product list.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/tally-products")}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Card>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    return status?.toLowerCase() === "active" ? "success" : "default";
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const handleAddSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const handleRemoveSpecification = (index) => {
    if (specifications.length > 1) {
      const newSpecs = specifications.filter((_, i) => i !== index);
      setSpecifications(newSpecs);
    }
  };

  const handleEditSpec = (variant) => {
    try {
      let specString = variant.productSpecification;
      
      // Fix common JSON formatting issues
      if (specString) {
        // Remove any surrounding quotes and braces if they exist
        specString = specString.replace(/^['"`{]*|[}'"`]*$/g, '');
        
        // Fix missing comma before "description"
        specString = specString.replace(/"Warning Video"\s*:\s*"[^"]*"\s*"description"/, 
          '"Warning Video" : "https://youtu.be/XTY1_4RFxss?si=fkdObTRoLMmy4tpF", "description"');
        
        // Ensure it's wrapped in proper braces
        if (!specString.startsWith('{')) {
          specString = '{' + specString;
        }
        if (!specString.endsWith('}')) {
          specString = specString + '}';
        }
      }
      
      const existingSpecs = specString ? JSON.parse(specString) : {};
      
      const specsArray = Object.entries(existingSpecs).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      
      setSpecifications(specsArray.length > 0 ? specsArray : [{ key: "", value: "" }]);
    } catch (error) {
      console.error('Error parsing specifications:', error);
      // If JSON parsing fails, try to extract key-value pairs manually
      const specString = variant.productSpecification || "";
      
      // Try to extract key-value pairs using regex
      const matches = specString.match(/"([^"]+)"\s*:\s*"([^"]+)"/g) || [];
      const specsArray = matches.map(match => {
        const [, key, value] = match.match(/"([^"]+)"\s*:\s*"([^"]+)"/);
        return { key, value };
      });
      
      setSpecifications(specsArray.length > 0 ? specsArray : [
        { key: "Description", value: specString }
      ]);
    }
    setSelectedProduct(variant);
    setEditDialogOpen(true);
  };

  const handleViewReviews = (variant) => {
    setSelectedProduct(variant);
    setReviewDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedProduct(null);
    setSpecifications([{ key: "", value: "" }]);
  };

  const handleReviewDialogClose = () => {
    setReviewDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleAddReviewDialogClose = () => {
    setAddReviewDialogOpen(false);
    setNewReview({ rating: 0, comment: "" });
  };

  const handleEditReviewDialogClose = () => {
    setEditReviewDialogOpen(false);
    setEditingReview(null);
  };

  const handleDeleteReviewDialogClose = () => {
    setDeleteReviewDialogOpen(false);
    setDeletingReview(null);
  };

  const handleReviewMenuClose = () => {
    setReviewMenuAnchor(null);
    setSelectedReview(null);
  };

  const handleEditDialogSave = async () => {
    try {
      const specsObject = {};
      specifications.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          specsObject[spec.key.trim()] = spec.value.trim();
        }
      });

      const specsString = Object.keys(specsObject).length > 0 
        ? JSON.stringify(specsObject) 
        : "";

      await updateTallyProduct({
        id: selectedProduct.id,
        productSpecification: specsString,
      }).unwrap();

      // Update local productData state
      setProductData(prevData => ({
        ...prevData,
        variants: prevData.variants.map(variant => 
          variant.id === selectedProduct.id 
            ? { ...variant, productSpecification: specsString }
            : variant
        )
      }));

      setSnackbar({
        open: true,
        message: "Specification updated successfully!",
        severity: "success",
      });
      handleEditDialogClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to update specification",
        severity: "error",
      });
    }
  };

  const handleAddReview = () => {
    setAddReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    try {
      await addProductReview({
        productId: selectedProduct.id,
        rating: newReview.rating,
        comment: newReview.comment,
      }).unwrap();
      setSnackbar({
        open: true,
        message: "Review added successfully!",
        severity: "success",
      });
      handleAddReviewDialogClose();
      refetchReviews();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to add review",
        severity: "error",
      });
    }
  };

  const handleEditReview = (review) => {
    setEditingReview({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      productId: selectedProduct.id,
    });
    setEditReviewDialogOpen(true);
    handleReviewMenuClose();
  };

  const handleSubmitEditReview = async () => {
    try {
      await updateProductReview(editingReview).unwrap();
      setSnackbar({
        open: true,
        message: "Review updated successfully!",
        severity: "success",
      });
      handleEditReviewDialogClose();
      refetchReviews();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to update review",
        severity: "error",
      });
    }
  };

  const handleDeleteReview = (review) => {
    setDeletingReview(review);
    setDeleteReviewDialogOpen(true);
    handleReviewMenuClose();
  };

  const handleConfirmDeleteReview = async () => {
    try {
      await deleteProductReview(deletingReview.id).unwrap();
      setSnackbar({
        open: true,
        message: "Review deleted successfully!",
        severity: "success",
      });
      handleDeleteReviewDialogClose();
      refetchReviews();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to delete review",
        severity: "error",
      });
    }
  };

  const handleReviewMenuClick = (event, review) => {
    setReviewMenuAnchor(event.currentTarget);
    setSelectedReview(review);
  };

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const displaySpecifications = (specString) => {
    if (!specString) return (
      <Typography variant="body2" sx={{ color: "#999", fontStyle: "italic" }}>
        No specifications available
      </Typography>
    );
    
    try {
      const specs = JSON.parse(specString);
      
      if (Object.keys(specs).length === 0) {
        return (
          <Typography variant="body2" sx={{ color: "#999", fontStyle: "italic" }}>
            No specifications available
          </Typography>
        );
      }
      
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {Object.entries(specs).map(([key, value]) => {
            const isVideoLink = key.toLowerCase().includes('video') && 
                               typeof value === 'string' && 
                               (value.includes('youtube.com') || value.includes('youtu.be'));
            
            return (
              <SpecificationItem key={key}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: "var(--purpleShadeBg)", 
                    fontWeight: 600,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  {key}
                </Typography>
                
                {isVideoLink ? (
                  <VideoLink
                    onClick={() => window.open(value, '_blank')}
                    sx={{
                      "&:hover": {
                        "& .video-icon": {
                          color: "#dc2626",
                        }
                      }
                    }}
                  >
                    <Box
                      className="video-icon"
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "2px",
                        backgroundColor: "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "8px",
                        fontWeight: "bold",
                        transition: "all 0.2s ease"
                      }}
                    >
                      ▶
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "#374151",
                        fontSize: "12px",
                        fontWeight: 500,
                        textDecoration: "underline",
                        textDecorationColor: "transparent",
                        transition: "text-decoration-color 0.2s ease",
                        "&:hover": {
                          textDecorationColor: "#dc2626",
                        }
                      }}
                    >
                      Watch Video
                    </Typography>
                  </VideoLink>
                ) : (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: "#374151",
                      fontSize: "13px",
                      lineHeight: 1.4,
                      wordBreak: "break-word"
                    }}
                  >
                    {String(value)}
                  </Typography>
                )}
              </SpecificationItem>
            );
          })}
        </Box>
      )} catch (error) {
        console.error('Error parsing specifications:', error);
        
        // Try to extract and display as raw text with better formatting
        const lines = specString.split(/[,;]/).filter(line => line.trim());
        
        if (lines.length > 1) {
          return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {lines.map((line, index) => (
                <Typography 
                  key={index}
                  variant="body2" 
                  sx={{ 
                    color: "#374151",
                    fontSize: "12px",
                    padding: "4px 8px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "4px",
                    borderLeft: "3px solid var(--purpleShadeBg)"
                  }}
                >
                  {line.trim()}
                </Typography>
              ))}
            </Box>
          );
        }
        
        return (
          <Typography 
            variant="body2" 
            sx={{ 
              color: "#374151",
              fontSize: "12px",
              padding: "8px 12px",
              backgroundColor: "#f9fafb",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              wordBreak: "break-word"
            }}
          >
            {specString}
          </Typography>
        );
      }
    };

  return (
    <Container>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          color: "var(--textColor)",
          minHeight: "300px",
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={() => navigate("/tally-products")}
                sx={{
                  color: "var(--purpleShadeBg)",
                  "&:hover": {
                    backgroundColor: "rgba(80, 60, 180, 0.1)",
                  },
                }}
              >
                <ArrowLeft size={20} />
              </IconButton>
              <Package size={22} color="var(--textColor)" />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "var(--textColor)",
                  fontSize: "22px",
                }}
                component="span"
              >
                {productData.mainProduct} - Product Variants
              </Typography>
            </Box>
          }
        />
        <CardContent>
          <Box
            sx={{
              mb: 4,
              p: 3,
              backgroundColor: "#f9f9f9",
              borderRadius: "12px",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {productData.mainProduct}
            </Typography>
            <Box sx={{ display: "flex", gap: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Tag size={16} color="#666" />
                <Typography variant="body2" sx={{ color: "#666" }}>
                  {productData.variants?.length || 0} Variants
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DollarSign size={16} color="#666" />
                <Typography variant="body2" sx={{ color: "#666" }}>
                  ₹
                  {Math.min(
                    ...(productData.variants?.map((v) => parseFloat(v.price)) ||
                      [0])
                  )}{" "}
                  - ₹
                  {Math.max(
                    ...(productData.variants?.map((v) => parseFloat(v.price)) ||
                      [0])
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Product Variants
          </Typography>

          {productData.variants?.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 8,
                gap: 2,
              }}
            >
              <Package size={48} color="#ccc" />
              <Typography variant="body1" sx={{ color: "#666" }}>
                No variants found for this product
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {productData.variants?.map((variant) => (
                <Grid item xs={12} sm={6} md={4} key={variant.id}>
                  <VariantCard elevation={1}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {variant.productName}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: "var(--purpleShadeBg)",
                          }}
                        >
                          ₹{variant.price}
                        </Typography>
                        <Chip
                          label={variant.status}
                          color={getStatusColor(variant.status)}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 500,
                            borderRadius: "8px",
                          }}
                        />
                      </Box>
                    </Box>

                    {variant.productSpecification && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 1, 
                          mb: 1.5 
                        }}>
                          <Box
                            sx={{
                              width: 4,
                              height: 16,
                              backgroundColor: "var(--purpleShadeBg)",
                              borderRadius: "2px"
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ 
                              color: "#374151", 
                              fontWeight: 600, 
                              fontSize: "13px",
                              letterSpacing: "0.3px"
                            }}
                          >
                            Product Specifications
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            maxHeight: 160,
                            overflow: "auto",
                            p: 1.5,
                            backgroundColor: "#fafbfc",
                            borderRadius: "10px",
                            border: "1px solid #e1e5e9",
                            "&::-webkit-scrollbar": {
                              width: "4px",
                            },
                            "&::-webkit-scrollbar-track": {
                              backgroundColor: "#f1f3f4",
                              borderRadius: "2px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              backgroundColor: "#c1c7cd",
                              borderRadius: "2px",
                              "&:hover": {
                                backgroundColor: "#a8b1ba",
                              },
                            },
                          }}
                        >
                          {displaySpecifications(variant.productSpecification)}
                        </Box>
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "space-between",
                      }}
                    >
                      <Button
                        size="small"
                        startIcon={<Edit2 size={14} />}
                        onClick={() => handleEditSpec(variant)}
                        sx={{
                          color: "var(--purpleShadeBg)",
                          borderColor: "var(--purpleShadeBg)",
                          borderRadius: "8px",
                          fontSize: "12px",
                          textTransform: "none",
                          flex: 1,
                          "&:hover": {
                            backgroundColor: "rgba(80, 60, 180, 0.1)",
                          },
                        }}
                        variant="outlined"
                      >
                        Edit Spec
                      </Button>
                      <Button
                        size="small"
                        startIcon={<MessageSquare size={14} />}
                        onClick={() => handleViewReviews(variant)}
                        sx={{
                          color: "#f59e0b",
                          borderColor: "#f59e0b",
                          borderRadius: "8px",
                          fontSize: "12px",
                          textTransform: "none",
                          flex: 1,
                          "&:hover": {
                            backgroundColor: "rgba(245, 158, 11, 0.1)",
                          },
                        }}
                        variant="outlined"
                      >
                        Reviews
                      </Button>
                    </Box>
                  </VariantCard>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Edit Specification Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: 500,
            minWidth: 600,
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(80, 60, 180, 0.15)",
            background: "#fff",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 22,
            color: "var(--purpleShadeBg)",
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <Edit2 size={22} />
          Edit Product Specifications
          <IconButton
            onClick={handleEditDialogClose}
            size="small"
            sx={{ ml: "auto", color: "inherit" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            mt: 2,
            px: 3,
            py: 2,
            background: "rgba(255,255,255,0.95)",
            borderRadius: 3,
          }}
        >
          {selectedProduct && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#333" }}
              >
                Product: {selectedProduct.productName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                Price: ₹{selectedProduct.price}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Product Specifications
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={handleAddSpecification}
              sx={{
                color: "var(--purpleShadeBg)",
                borderColor: "var(--purpleShadeBg)",
                borderRadius: "8px",
                fontSize: "12px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(80, 60, 180, 0.1)",
                },
              }}
            >
              Add Field
            </Button>
          </Box>

          <Box
            sx={{
              maxHeight: 300,
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {specifications.map((spec, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                  p: 2,
                  backgroundColor: "#f8f9fa",
                  borderRadius: "12px",
                  border: "1px solid #e9ecef",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#374151",
                      mb: 0.5,
                    }}
                  >
                    Key
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={spec.key}
                    onChange={(e) =>
                      handleSpecificationChange(index, "key", e.target.value)
                    }
                    placeholder="e.g., Opening Video"
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: "14px",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--textFieldBorderColor, #ced4da)",
                        borderRadius: "8px",
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#374151",
                      mb: 0.5,
                    }}
                  >
                    Value
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecificationChange(index, "value", e.target.value)
                    }
                    placeholder="e.g., https://youtu.be/3zE_vsiUkDg"
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: "14px",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--textFieldBorderColor, #ced4da)",
                        borderRadius: "8px",
                      },
                    }}
                  />
                </Box>
                {specifications.length > 1 && (
                  <Box sx={{ display: "flex", alignItems: "flex-end", pb: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveSpecification(index)}
                      sx={{
                        color: "#dc2626",
                        "&:hover": {
                          backgroundColor: "rgba(220, 38, 38, 0.1)",
                        },
                      }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleEditDialogClose}
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
            onClick={handleEditDialogSave}
            disabled={isUpdating}
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
            {isUpdating ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Update Specifications"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rest of the dialogs remain the same... */}
      {/* Reviews Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={handleReviewDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: 500,
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(80, 60, 180, 0.15)",
            background: "#fff",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 22,
            color: "var(--purpleShadeBg)",
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <Star size={22} />
          Product Reviews
          <IconButton
            onClick={handleReviewDialogClose}
            size="small"
            sx={{ ml: "auto", color: "inherit" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          {selectedProduct && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
                {selectedProduct.productName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                Price: ₹{selectedProduct.price}
              </Typography>
              {reviews.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 1,
                  }}
                >
                  <Rating
                    value={parseFloat(getAverageRating(reviews))}
                    readOnly
                    precision={0.1}
                  />
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    {getAverageRating(reviews)} (
                    {reviews.length} review{reviews.length !== 1 ? "s" : ""})
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Customer Reviews
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<Star size={18} />}
              onClick={handleAddReview}
              sx={{
                backgroundColor: "#f59e0b",
                color: "white",
                borderRadius: "12px",
                fontWeight: 500,
                fontSize: "14px",
                textTransform: "none",
                px: 2,
                py: 1,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#d97706",
                  boxShadow: "none",
                },
              }}
            >
              Add Review
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {isLoadingReviews ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : reviews.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 4,
                gap: 2,
              }}
            >
              <Star size={48} color="#ccc" />
              <Typography variant="body1" sx={{ color: "#666" }}>
                No reviews yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 400, overflow: "auto" }}>
              {reviews.map((review, index) => (
                <ListItem key={review.id || index} sx={{ px: 0, py: 2 }}>
                  <Box sx={{ width: "100%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 1,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "var(--purpleShadeBg)",
                        }}
                      >
                        <User size={20} />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          Anonymous User
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Rating value={review.rating} readOnly size="small" />
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleReviewMenuClick(e, review)}
                        sx={{
                          color: "#666",
                          "&:hover": {
                            backgroundColor: "rgba(0,0,0,0.04)",
                          },
                        }}
                      >
                        <MoreVertical size={16} />
                      </IconButton>
                    </Box>
                    {review.comment && (
                      <Typography variant="body2" sx={{ ml: 6, color: "#333" }}>
                        {review.comment}
                      </Typography>
                    )}
                    {index < reviews.length - 1 && (
                      <Divider sx={{ mt: 2 }} />
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Actions Menu */}
      <Menu
        anchorEl={reviewMenuAnchor}
        open={Boolean(reviewMenuAnchor)}
        onClose={handleReviewMenuClose}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            minWidth: 120,
          },
        }}
      >
        <MenuItem onClick={() => handleEditReview(selectedReview)}>
          <Edit2 size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteReview(selectedReview)}
          sx={{ color: "#dc2626" }}
        >
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add Review Dialog */}
      <Dialog
        open={addReviewDialogOpen}
        onClose={handleAddReviewDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(80, 60, 180, 0.15)",
            background: "#fff",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 22,
            color: "var(--purpleShadeBg)",
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <Star size={22} />
          Add Review
          <IconButton
            onClick={handleAddReviewDialogClose}
            size="small"
            sx={{ ml: "auto", color: "inherit" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  mb: 1,
                }}
              >
                Rating
              </Typography>
              <Rating
                value={newReview.rating}
                onChange={(event, newValue) => {
                  setNewReview((prev) => ({ ...prev, rating: newValue || 0 }));
                }}
                size="large"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  mb: 0.5,
                }}
              >
                Comment
              </Typography>
              <TextField
                multiline
                minRows={4}
                fullWidth
                variant="outlined"
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder="Write your review..."
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "14px",
                    borderRadius: "12px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--textFieldBorderColor, #ced4da)",
                    borderRadius: "12px",
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleAddReviewDialogClose}
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
            onClick={handleSubmitReview}
            disabled={isAddingReview || newReview.rating === 0}
            sx={{
              backgroundColor: "#f59e0b",
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
                backgroundColor: "#d97706",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              },
              "&:disabled": {
                backgroundColor: "#ccc",
                color: "#666",
              },
            }}
          >
            {isAddingReview ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Review Dialog */}
      <Dialog
        open={editReviewDialogOpen}
        onClose={handleEditReviewDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(80, 60, 180, 0.15)",
            background: "#fff",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 22,
            color: "var(--purpleShadeBg)",
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <Edit2 size={22} />
          Edit Review
          <IconButton
            onClick={handleEditReviewDialogClose}
            size="small"
            sx={{ ml: "auto", color: "inherit" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  mb: 1,
                }}
              >
                Rating
              </Typography>
              <Rating
                value={editingReview?.rating || 0}
                onChange={(event, newValue) => {
                  setEditingReview((prev) => ({ ...prev, rating: newValue || 0 }));
                }}
                size="large"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  mb: 0.5,
                }}
              >
                Comment
              </Typography>
              <TextField
                multiline
                minRows={4}
                fullWidth
                variant="outlined"
                value={editingReview?.comment || ""}
                onChange={(e) =>
                  setEditingReview((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder="Write your review..."
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "14px",
                    borderRadius: "12px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--textFieldBorderColor, #ced4da)",
                    borderRadius: "12px",
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleEditReviewDialogClose}
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
            onClick={handleSubmitEditReview}
            disabled={isUpdatingReview || !editingReview?.rating}
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
              "&:disabled": {
                backgroundColor: "#ccc",
                color: "#666",
              },
            }}
          >
            {isUpdatingReview ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Update Review"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Review Confirmation Dialog */}
      <Dialog
        open={deleteReviewDialogOpen}
        onClose={handleDeleteReviewDialogClose}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(220, 38, 38, 0.15)",
            background: "#fff",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 22,
            color: "#dc2626",
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <Trash2 size={22} />
          Delete Review
          <IconButton
            onClick={handleDeleteReviewDialogClose}
            size="small"
            sx={{ ml: "auto", color: "inherit" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography variant="body1" sx={{ color: "#374151", mb: 2 }}>
            Are you sure you want to delete this review? This action cannot be
            undone.
          </Typography>
          {deletingReview && (
            <Box
              sx={{
                p: 2,
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <Rating value={deletingReview.rating} readOnly size="small" />
                <Typography variant="body2" sx={{ color: "#666" }}>
                  {new Date(deletingReview.createdAt || Date.now()).toLocaleDateString()}
                </Typography>
              </Box>
              {deletingReview.comment && (
                <Typography variant="body2" sx={{ color: "#333" }}>
                  "{deletingReview.comment}"
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleDeleteReviewDialogClose}
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
            onClick={handleConfirmDeleteReview}
            disabled={isDeletingReview}
            sx={{
              backgroundColor: "#dc2626",
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
                backgroundColor: "#b91c1c",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              },
              "&:disabled": {
                backgroundColor: "#ccc",
                color: "#666",
              },
            }}
          >
            {isDeletingReview ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Delete Review"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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
    </Container>
  );
};

export default TallyProductVariants;