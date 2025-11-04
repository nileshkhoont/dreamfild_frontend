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
  Chip,
  Snackbar,
  Alert,
  Divider,
  Rating,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Package,
  Edit2,
  ArrowLeft,
  Tag,
  DollarSign,
  Plus,
  Upload,
  X,
  Trash2,
  Star,
  MessageSquare,
} from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useUpdateTallyProductMutation,
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

const ReviewItem = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginBottom: "12px",
  padding: "12px 16px",
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

const ImageUploadContainer = styled(Box)({
  border: "2px dashed #e0e0e0",
  borderRadius: "12px",
  padding: "2rem",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "var(--purpleShadeBg)",
    backgroundColor: "rgba(80, 60, 180, 0.05)",
  },
  "&.dragover": {
    borderColor: "var(--purpleShadeBg)",
    backgroundColor: "rgba(80, 60, 180, 0.1)",
  },
});

const ImagePreviewContainer = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  marginTop: "16px",
});

const ImagePreviewItem = styled(Box)({
  position: "relative",
  width: "120px",
  height: "120px",
  borderRadius: "8px",
  overflow: "hidden",
  border: "1px solid #e0e0e0",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});

const RemoveImageButton = styled(IconButton)({
  position: "absolute",
  top: "4px",
  right: "4px",
  backgroundColor: "rgba(220, 38, 38, 0.9)",
  color: "white",
  width: "24px",
  height: "24px",
  "&:hover": {
    backgroundColor: "rgba(220, 38, 38, 1)",
  },
});

// Custom Tab Panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const TallyProductVariants = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [productData, setProductData] = useState(location.state?.productData);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [reviews, setReviews] = useState([{ rating: 5, comment: "" }]);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // State variables for image handling
  const [selectedImages, setSelectedImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const [updateTallyProduct, { isLoading: isUpdating }] =
    useUpdateTallyProductMutation();

  // Image handling functions
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImages(prev => [...prev, {
          file,
          preview: e.target.result,
          id: Date.now() + Math.random()
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const removeImage = (imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };

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

  // Review handling functions
  const handleReviewChange = (index, field, value) => {
    const newReviews = [...reviews];
    newReviews[index][field] = value;
    setReviews(newReviews);
  };

  const handleAddReview = () => {
    setReviews([...reviews, { rating: 5, comment: "" }]);
  };

  const handleRemoveReview = (index) => {
    if (reviews.length > 1) {
      const newReviews = reviews.filter((_, i) => i !== index);
      setReviews(newReviews);
    }
  };

  const handleEditSpec = (variant) => {
    try {
      // Handle specifications
      let specString = variant.productSpecification;
      
      if (specString) {
        specString = specString.replace(/^['"`{]*|[}'"`]*$/g, '');
        specString = specString.replace(/"Warning Video"\s*:\s*"[^"]*"\s*"description"/, 
          '"Warning Video" : "https://youtu.be/XTY1_4RFxss?si=fkdObTRoLMmy4tpF", "description"');
        
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
      const specString = variant.productSpecification || "";
      const matches = specString.match(/"([^"]+)"\s*:\s*"([^"]+)"/g) || [];
      const specsArray = matches.map(match => {
        const [, key, value] = match.match(/"([^"]+)"\s*:\s*"([^"]+)"/);
        return { key, value };
      });
      
      setSpecifications(specsArray.length > 0 ? specsArray : [
        { key: "Description", value: specString }
      ]);
    }

    // Handle reviews
    try {
      let reviewString = variant.productReview;
      let existingReviews = [];
      
      if (reviewString) {
        existingReviews = JSON.parse(reviewString);
        if (!Array.isArray(existingReviews)) {
          existingReviews = [];
        }
      }
      
      const reviewsArray = existingReviews.map(review => ({
        rating: review.rating || 5,
        comment: review.comment || ""
      }));
      
      setReviews(reviewsArray.length > 0 ? reviewsArray : [{ rating: 5, comment: "" }]);
    } catch (error) {
      console.error('Error parsing reviews:', error);
      setReviews([{ rating: 5, comment: "" }]);
    }
    
    setSelectedProduct(variant);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedProduct(null);
    setSpecifications([{ key: "", value: "" }]);
    setReviews([{ rating: 5, comment: "" }]);
    setSelectedImages([]);
    setTabValue(0);
  };

  const handleEditDialogSave = async () => {
    try {
      const formData = new FormData();
      
      formData.append('id', selectedProduct.id);
      
      // Add specifications
      const specsObject = {};
      specifications.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          specsObject[spec.key.trim()] = spec.value.trim();
        }
      });
      
      const specsString = Object.keys(specsObject).length > 0 
        ? JSON.stringify(specsObject) 
        : "";
      
      formData.append('productSpecification', specsString);
      
      // Add reviews
      const reviewsArray = reviews.filter(review => review.comment.trim());
      const reviewsString = reviewsArray.length > 0 
        ? JSON.stringify(reviewsArray) 
        : "";
      
      formData.append('productReview', reviewsString);
      
      // Add images
      selectedImages.forEach((imageObj) => {
        formData.append(`images`, imageObj.file);
      });

      await updateTallyProduct(formData).unwrap();

      // Update local productData state
      setProductData(prevData => ({
        ...prevData,
        variants: prevData.variants.map(variant => 
          variant.id === selectedProduct.id 
            ? { 
                ...variant, 
                productSpecification: specsString,
                productReview: reviewsString
              }
            : variant
        )
      }));

      setSnackbar({
        open: true,
        message: "Product updated successfully!",
        severity: "success",
      });
      handleEditDialogClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to update product",
        severity: "error",
      });
    }
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

  const displayReviews = (reviewString) => {
    if (!reviewString) return (
      <Typography variant="body2" sx={{ color: "#999", fontStyle: "italic" }}>
        No reviews available
      </Typography>
    );
    
    try {
      const reviews = JSON.parse(reviewString);
      
      if (!Array.isArray(reviews) || reviews.length === 0) {
        return (
          <Typography variant="body2" sx={{ color: "#999", fontStyle: "italic" }}>
            No reviews available
          </Typography>
        );
      }
      
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {reviews.map((review, index) => (
            <ReviewItem key={index}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Rating
                  value={review.rating || 0}
                  readOnly
                  size="small"
                  sx={{
                    "& .MuiRating-iconFilled": {
                      color: "#fbbf24",
                    },
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: "#666",
                    fontWeight: 500,
                  }}
                >
                  ({review.rating || 0}/5)
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: "#374151",
                  fontSize: "13px",
                  lineHeight: 1.4,
                  wordBreak: "break-word"
                }}
              >
                {review.comment}
              </Typography>
            </ReviewItem>
          ))}
        </Box>
      );
    } catch (error) {
      console.error('Error parsing reviews:', error);
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
          {reviewString}
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

                    {/* Product Specifications */}
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

                    {/* Product Reviews */}
                    {variant.productReview && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 1, 
                          mb: 1.5 
                        }}>
                          <Star size={16} color="var(--purpleShadeBg)" />
                          <Typography
                            variant="body2"
                            sx={{ 
                              color: "#374151", 
                              fontWeight: 600, 
                              fontSize: "13px",
                              letterSpacing: "0.3px"
                            }}
                          >
                            Product Reviews
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
                          {displayReviews(variant.productReview)}
                        </Box>
                      </Box>
                    )}

                    {/* Product Images Section */}
                    {variant.images && variant.images.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            overflow: "auto",
                            pb: 1,
                            "&::-webkit-scrollbar": {
                              height: "4px",
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
                          {variant.images.map((image, index) => (
                            <Box
                              key={image.id}
                              sx={{
                                position: "relative",
                                minWidth: "80px",
                                width: "80px",
                                height: "80px",
                                borderRadius: "8px",
                                overflow: "hidden",
                                border: "2px solid #e0e0e0",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  borderColor: "var(--purpleShadeBg)",
                                  transform: "scale(1.05)",
                                },
                              }}
                              onClick={() => {
                                window.open(`${import.meta.env.VITE_BACKEND_URL}${image.imageUrl}`, '_blank');
                              }}
                            >
                              <img
                                src={`${import.meta.env.VITE_BACKEND_URL}${image.imageUrl}`}
                                alt={`${variant.productName} - Image ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentNode.innerHTML = `
                                    <div style="
                                      width: 100%;
                                      height: 100%;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      background-color: #f5f5f5;
                                      color: #999;
                                      font-size: 12px;
                                    ">
                                      No Image
                                    </div>
                                  `;
                                }}
                              />
                              {variant.images.length > 1 && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: "4px",
                                    right: "4px",
                                    backgroundColor: "rgba(0,0,0,0.7)",
                                    color: "white",
                                    borderRadius: "4px",
                                    padding: "2px 4px",
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {index + 1}/{variant.images.length}
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: "flex", justifyContent: "center" }}>
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
                        Edit Product
                      </Button>
                    </Box>
                  </VariantCard>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog with Tabs */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '95vh',
            maxHeight: '95vh',
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(80, 60, 180, 0.15)",
            background: "#fff",
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
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
            flexShrink: 0,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Edit2 size={22} />
          Edit Product Details
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
            gap: 0,
            px: 0,
            py: 0,
            background: "rgba(255,255,255,0.95)",
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {selectedProduct && (
            <Box
              sx={{
                p: 3,
                backgroundColor: "#f9f9f9",
                borderBottom: '1px solid #e0e0e0',
                flexShrink: 0,
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

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, flexShrink: 0 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab
                icon={<Upload size={16} />}
                label="Images"
                iconPosition="start"
                sx={{ textTransform: 'none', fontSize: '14px' }}
              />
              <Tab
                icon={<Package size={16} />}
                label="Specifications"
                iconPosition="start"
                sx={{ textTransform: 'none', fontSize: '14px' }}
              />
              <Tab
                icon={<Star size={16} />}
                label="Reviews"
                iconPosition="start"
                sx={{ textTransform: 'none', fontSize: '14px' }}
              />
            </Tabs>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              px: 3,
              py: 2,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: '3px',
                '&:hover': {
                  backgroundColor: '#a1a1a1',
                },
              },
            }}
          >
            {/* Images Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Product Images
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  {selectedImages.length} image(s) selected
                </Typography>
              </Box>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
                id="image-upload-input"
              />
              
              <ImageUploadContainer
                className={dragOver ? 'dragover' : ''}
                onClick={() => document.getElementById('image-upload-input').click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                  minHeight: '120px',
                  padding: '1.5rem',
                }}
              >
                <Upload size={40} color="#ccc" />
                <Typography variant="h6" sx={{ mt: 1, mb: 0.5, color: "#666", fontSize: '16px' }}>
                  Upload Product Images
                </Typography>
                <Typography variant="body2" sx={{ color: "#999", fontSize: '12px' }}>
                  Drag and drop images here or click to browse
                </Typography>
                <Typography variant="caption" sx={{ color: "#999", mt: 0.5, display: "block", fontSize: '10px' }}>
                  Supports: JPG, PNG, GIF (Max 5MB per image)
                </Typography>
              </ImageUploadContainer>

              {selectedImages.length > 0 && (
                <ImagePreviewContainer sx={{ mt: 1 }}>
                  {selectedImages.map((imageObj) => (
                    <ImagePreviewItem key={imageObj.id} sx={{ width: '80px', height: '80px' }}>
                      <img src={imageObj.preview} alt="Preview" />
                      <RemoveImageButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(imageObj.id);
                        }}
                        sx={{ width: '20px', height: '20px', top: '2px', right: '2px' }}
                      >
                        <X size={12} />
                      </RemoveImageButton>
                    </ImagePreviewItem>
                  ))}
                </ImagePreviewContainer>
              )}
            </TabPanel>

            {/* Specifications Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
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

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
            </TabPanel>

            {/* Reviews Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Product Reviews
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Plus size={16} />}
                  onClick={handleAddReview}
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
                  Add Review
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {reviews.map((review, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      p: 2,
                      backgroundColor: "#f8f9fa",
                      borderRadius: "12px",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                          Rating
                        </Typography>
                        <Rating
                          value={review.rating}
                          onChange={(e, newValue) =>
                            handleReviewChange(index, "rating", newValue)
                          }
                          sx={{
                            "& .MuiRating-iconFilled": {
                              color: "#fbbf24",
                            },
                          }}
                        />
                      </Box>
                      {reviews.length > 1 && (
                        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveReview(index)}
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
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#374151",
                          mb: 0.5,
                        }}
                      >
                        Comment
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        variant="outlined"
                        value={review.comment}
                        onChange={(e) =>
                          handleReviewChange(index, "comment", e.target.value)
                        }
                        placeholder="Write your review comment..."
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
                  </Box>
                ))}
              </Box>
            </TabPanel>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2, flexShrink: 0, borderTop: '1px solid #e0e0e0' }}>
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
              "Update Product"
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