import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled,
  TablePagination,
  CircularProgress,
  Button,
  IconButton,
  Switch,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Plus, Upload, File, X, Percent } from "lucide-react";
import { useGetMediaQuery, useUpdateMediaStatusMutation, useUploadMediaMutation } from "../../apiService";

const Container = styled(Box)({
  margin: "0 auto",
  paddingTop: "2rem",
  overflow: "hidden",
});

const StyledTableContainer = styled(TableContainer)({
  borderRadius: 16,
  border: "none",
  "& .MuiTableCell-head": {
    backgroundColor: "var(--tableHeaderBackgroundColor)",
    fontWeight: 600,
    color: "var(--textColor)",
    borderBottom: "none",
    position: "sticky",
    top: 0,
    zIndex: 0,
  },
  "& .MuiTableCell-root": { borderBottom: "none", borderRight: "none" },
  "& .MuiTableRow-root:hover": {
    backgroundColor: "var(--hoverBackgroundColor)",
    transition: "background-color 0.3s ease",
  },
});

const SchemeList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [previewModal, setPreviewModal] = useState({
    open: false,
    imageUrl: "",
    fileName: "",
  });
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const fileInputRef = React.useRef();

  const { data, isLoading, refetch } = useGetMediaQuery({ page: page + 1, limit: rowsPerPage, type: "Offer" });
  const [updateMediaStatus] = useUpdateMediaStatusMutation();

  const schemeList = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusToggle = async (scheme) => {
    const newStatus = scheme.status === "active" ? "deactive" : "active";
    try {
      await updateMediaStatus({ id: scheme.id, status: newStatus }).unwrap();
      setSnackbar({
        open: true,
        message: `Status updated to ${newStatus}`,
        severity: "success",
      });
      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to update status",
        severity: "error",
      });
    }
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("url", "");
      await uploadMedia({ formData, type: "Offer" }).unwrap();
      setSnackbar({
        open: true,
        message: "Scheme uploaded successfully!",
        severity: "success",
      });
      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to upload scheme",
        severity: "error",
      });
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleUploadButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const getStatusColor = (status) => {
    return status?.toLowerCase() === "active" ? "primary" : "default";
  };

  const getImageUrl = (fileUrl) => {
    if (!fileUrl) return null;
    
    // Check if the URL already starts with http
    if (fileUrl.startsWith('http')) {
      return fileUrl;
    }
    
    console.log('Original fileUrl:', fileUrl);
    
    let finalUrl = '';
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'https://dealerapi.cryptoinsecticides.com';
    
    // Extract just the filename from the path
    let filename = '';
    
    if (fileUrl.includes('/')) {
      // Extract filename from path like /home/movya-dealer-backend/uploads/media/file-1763199915625-492039736.jpg
      const parts = fileUrl.split('/');
      filename = parts[parts.length - 1];
    } else {
      filename = fileUrl;
    }
    
    // Construct the URL
    finalUrl = `${baseUrl}/uploads/media/${filename}`;
    
    console.log('Final image URL:', finalUrl);
    return finalUrl;
  };

  const handleImageClick = (scheme) => {
    const imageUrl = getImageUrl(scheme.fileUrl);
    if (imageUrl) {
      setPreviewModal({
        open: true,
        imageUrl,
        fileName: scheme.fileName,
      });
    }
  };

  const handleClosePreview = () => {
    setPreviewModal({
      open: false,
      imageUrl: "",
      fileName: "",
    });
  };

  // For debugging: Try to fetch the image with credentials
  const testImageLoad = (url) => {
    const img = new Image();
    // img.crossOrigin = "anonymous"; // Try to enable CORS
    img.src = url;
    img.onload = () => console.log('Image loaded successfully:', url);
    img.onerror = (e) => console.error('Image failed to load:', url, e);
  };

  return (
    <Container>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          color: "var(--textColor)",
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardHeader
          title={
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Percent size={22} color="var(--textColor)" />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: "var(--textColor)",
                      textAlign: "left",
                      fontSize: "22px",
                    }}
                    component="span"
                  >
                    Scheme List
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<Upload size={18} />}
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
                      boxShadow: "none",
                    },
                  }}
                  onClick={handleUploadButtonClick}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Scheme"}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileInputChange}
                  accept="*"
                />
              </Box>
            </Box>
          }
        />
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : schemeList.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
                gap: 2,
              }}
            >
              <Percent size={48} color="#ccc" />
              <Typography variant="body1" sx={{ color: "#666" }}>
                No scheme files found
              </Typography>
            </Box>
          ) : (
            <>
              <StyledTableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Preview</TableCell>
                      <TableCell>File Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schemeList.map((scheme) => {
                      const imageUrl = getImageUrl(scheme.fileUrl);
                      
                      // Test image loading
                      if (imageUrl) {
                        testImageLoad(imageUrl);
                      }
                      
                      return (
                        <TableRow key={scheme.id}>
                          <TableCell>{scheme.id}</TableCell>
                          <TableCell>
                            {imageUrl ? (
                              <Box
                                component="img"
                                src={imageUrl}
                                alt={scheme.fileName}
                                sx={{
                                  width: 60,
                                  height: 60,
                                  objectFit: "cover",
                                  borderRadius: 1,
                                  cursor: "pointer",
                                  border: "1px solid #e0e0e0",
                                  "&:hover": {
                                    opacity: 0.8,
                                    transition: "opacity 0.3s",
                                  },
                                }}
                                onClick={() => handleImageClick(scheme)}
                                crossOrigin="anonymous" // Try to enable CORS
                                onError={(e) => {
                                  console.error('Failed to load image:', imageUrl);
                                  // Show fallback with file name
                                  e.target.style.display = 'none';
                                  const parent = e.target.parentElement;
                                  parent.innerHTML = `
                                    <div style="
                                      width: 60px;
                                      height: 60px;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      background-color: #f5f5f5;
                                      border-radius: 4px;
                                      border: 1px solid #e0e0e0;
                                      color: #666;
                                      font-size: 10px;
                                      text-align: center;
                                      padding: 4px;
                                      word-break: break-all;
                                      overflow: hidden;
                                    ">
                                      ${scheme.fileName || 'Preview'}
                                    </div>
                                  `;
                                }}
                                onLoad={() => console.log('Image loaded successfully:', imageUrl)}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 60,
                                  height: 60,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "#f5f5f5",
                                  borderRadius: 1,
                                  border: "1px solid #e0e0e0",
                                  color: "#666",
                                  fontSize: "12px",
                                  textAlign: "center",
                                }}
                              >
                                Preview
                              </Box>
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {scheme.fileName || 'Unknown file'}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Chip
                                label={scheme.status || 'unknown'}
                                color={getStatusColor(scheme.status)}
                                size="small"
                                sx={{
                                  textTransform: "capitalize",
                                  fontWeight: 500,
                                  borderRadius: "8px",
                                  ...(scheme.status?.toLowerCase() === "active" && {
                                    backgroundColor: "#2563eb",
                                    color: "white",
                                  }),
                                }}
                              />
                              <Tooltip
                                title={`Toggle to ${scheme.status === "active" ? "deactive" : "active"
                                  }`}
                              >
                                <Switch
                                  checked={scheme.status === "active"}
                                  onChange={() => handleStatusToggle(scheme)}
                                  size="small"
                                  sx={{
                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                      color: "var(--purpleShadeBg)",
                                    },
                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                    {
                                      backgroundColor: "var(--purpleShadeBg)",
                                    },
                                  }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {scheme.createdAt
                              ? new Date(scheme.createdAt).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </StyledTableContainer>
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>

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

      {/* Image Preview Modal */}
      <Dialog
        open={previewModal.open}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {previewModal.fileName}
          </Typography>
          <IconButton
            onClick={handleClosePreview}
            size="small"
            sx={{
              color: "var(--textColor)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              maxHeight: "70vh",
            }}
          >
            <img
              src={previewModal.imageUrl}
              alt={previewModal.fileName}
              crossOrigin="anonymous" // Try to enable CORS
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: "8px",
              }}
              onError={(e) => {
                console.error('Failed to load preview image:', previewModal.imageUrl);
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                parent.innerHTML = `
                  <div style="text-align: center; padding: 20px;">
                    <p style="color: red; font-weight: bold;">Failed to load image preview</p>
                    <p style="font-size: 12px; margin-top: 10px; color: #666;">File: ${previewModal.fileName}</p>
                    <p style="font-size: 11px; margin-top: 5px; color: #999;">CORS Issue: Backend server needs to allow cross-origin requests</p>
                    <p style="font-size: 10px; margin-top: 5px; color: #999;">URL: ${previewModal.imageUrl}</p>
                  </div>
                `;
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default SchemeList;