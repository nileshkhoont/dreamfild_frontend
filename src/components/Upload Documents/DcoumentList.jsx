import React, { useState } from 'react';
import { Box, Card, CardHeader, CardContent, Typography, Button, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FileText, Trash2 } from 'lucide-react';
import DocumentForm from './DocumentForm';
import { useGetAllDocumentsQuery, useDeleteDocumentMutation } from '../../apiService';
import PreviewImg from "../Profile/PreviewImg";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Grid from "@mui/material/Grid";
import CardActionArea from "@mui/material/CardActionArea";
import Avatar from "@mui/material/Avatar";
// import DeleteDialogBox from "../DeleteDialogBox";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const Container = styled(Box)({
  // maxWidth: 1400,
  margin: "0 auto",
  paddingTop: "2rem",
});

const NoDocumentsMessage = styled(Box)({
  textAlign: "center",
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const NoDocumentsIcon = styled(Box)({
  color: "#666",
  opacity: 0.7,
  marginBottom: "1rem",
});

const DocumentList = () => {
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const orgId = user?.organization?._id;

  const { data, isLoading, isError, refetch } = useGetAllDocumentsQuery(orgId);
  const [deleteDocument] = useDeleteDocumentMutation();

  const documents = data?.data || [];

  const handleAddDocument = (data) => {
    // Handle document upload logic here (API call etc.)
    console.log("Document submitted:", data);
  };

  const handleDeleteClick = (e, doc) => {
    e.stopPropagation(); // Prevent card click/preview
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDocument = async (doc) => {
    console.log("handleDeleteDocument called with:", doc);
    if (!doc?.id) return;
    setIsDeleting(true);
    try {
      const res = await deleteDocument({ documentId: doc.id }).unwrap();
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      setSnackbar({ open: true, message: res.message || "Document deleted successfully.", severity: "success" });
      refetch(); // <-- Refresh the document list after delete
    } catch (error) {
      setSnackbar({ open: true, message: error?.data?.message || "Delete failed.", severity: "error" });
      console.error("Delete failed", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to check if file is image or pdf
  const isImage = (type) =>
    ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"].includes(type);
  const isPdf = (type) => type === "application/pdf";

  // Helper function to build full image URL
  const getImageUrl = (fileUrl) => {
    if (!fileUrl) return '';
    
    // Check if the URL already starts with http
    if (fileUrl.startsWith('http')) {
      return fileUrl;
    }
    
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'https://dealerapi.cryptoinsecticides.com';
    
    // Extract just the filename from the path
    let filename = '';
    
    if (fileUrl.includes('/')) {
      // Extract filename from path
      const parts = fileUrl.split('/');
      filename = parts[parts.length - 1];
      
      // Find if there's an "uploads" folder in the path
      const uploadsIndex = fileUrl.indexOf('uploads/');
      if (uploadsIndex !== -1) {
        // Extract path from uploads onward
        const uploadsPath = fileUrl.substring(uploadsIndex);
        return `${baseUrl}/${uploadsPath}`;
      } else {
        // Fallback: use just the filename
        return `${baseUrl}/uploads/media/${filename}`;
      }
    } else {
      filename = fileUrl;
      return `${baseUrl}/uploads/media/${filename}`;
    }
  };

  
  return (
    <Container>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          color: "var(--textColor)",
          pt: 0.9,
          minHeight: "calc(100vh - 120px)",
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
                  <FileText size={22} color="var(--textColor)" />
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
                    Document List
                  </Typography>
                </Box>
                {/* Hide Add Document button for user role */}
                {user?.role !== "user" && (
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
                         boxShadow: "none",
                      },
                    }}
                    onClick={handleOpen}
                  >
                    + Add Document
                  </Button>
                )}
              </Box>
            </Box>
          }
        />
        <CardContent sx={{ flexGrow: 1, pb: 3 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <NoDocumentsMessage sx={{ flexGrow: 1 }}>
              <NoDocumentsIcon>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1.5,
                    opacity: 0.8,
                  }}
                >
                  <FileText size={24} color="#757575" />
                </Box>
              </NoDocumentsIcon>
              <Typography variant="body1" sx={{ color: "#666" }}>
                Failed to load documents.
              </Typography>
            </NoDocumentsMessage>
          ) : documents.length === 0 ? (
            <NoDocumentsMessage sx={{ flexGrow: 1 }}>
              <NoDocumentsIcon>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1.5,
                    opacity: 0.8,
                  }}
                >
                  <FileText size={24} color="#757575" />
                </Box>
              </NoDocumentsIcon>
              <Typography variant="body1" sx={{ color: "#666" }}>
                No documents uploaded yet.
              </Typography>
            </NoDocumentsMessage>
          ) : (
            <Grid container spacing={3}>
              {documents.map((doc) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={doc._id}> {/* <-- use _id */}
                  <Card
                    sx={{
                      borderRadius: "10px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      overflow: "hidden",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      border: "1px solid #f0f0f0"
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        backgroundColor: "#fafafa",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "20px",
                        height: "140px",
                      }}
                    >
                      {/* Hide delete button for user role */}
                      {user?.role !== "user" && (
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "rgba(255,255,255,0.9)",
                            zIndex: 2,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                          }}
                          onClick={(e) => handleDeleteClick(e, doc)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      )}
                      
                      <CardActionArea
                        onClick={() => {
                          setPreviewSrc(getImageUrl(doc.fileUrl));
                          setPreviewOpen(true);
                        }}
                        sx={{ 
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          position: "absolute",
                          top: 0,
                          left: 0
                        }}
                      >
                        {isImage(doc.fileType) ? (
                          <img
                            src={getImageUrl(doc.fileUrl)}
                            alt={doc.documentName}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : isPdf(doc.fileType) ? (
                          <PictureAsPdfIcon sx={{ color: "#e53935", fontSize: 64 }} />
                        ) : (
                          <FileText size={64} color="#757575" />
                        )}
                      </CardActionArea>
                    </Box>

                    <Box sx={{ p: 2, flexGrow: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: "#333",
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {doc.documentName}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: "#666", 
                          fontSize: "0.75rem",
                          mb: 2 
                        }}
                      >
                        {doc.fileType.split('/')[1].toUpperCase()}
                      </Typography>
                      
                      <Box sx={{ mt: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {doc.user?.profilePhoto ? (
                            <Avatar
                              src={doc.user.profilePhoto}
                              alt={doc.user?.name}
                              sx={{ width: 24, height: 24, mr: 1 }}
                            />
                          ) : (
                            <Avatar
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                mr: 1, 
                                bgcolor: "var(--textColor)", 
                                color: "#fff",
                                fontSize: "12px"
                              }}
                            >
                              {doc.user?.name ? doc.user.name.charAt(0).toUpperCase() : "?"}
                            </Avatar>
                          )}
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            {doc.user?.name}
                          </Typography>
                        </Box>
                        <Tooltip title={new Date(doc.uploadedAt).toLocaleString()}>
                          <Typography variant="caption" sx={{ color: "#999" }}>
                            {(() => {
                              const d = new Date(doc.uploadedAt);
                              const day = String(d.getDate()).padStart(2, '0');
                              const month = String(d.getMonth() + 1).padStart(2, '0');
                              const year = d.getFullYear();
                              return `${day}-${month}-${year}`;
                            })()}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      <DocumentForm
        open={open}
        handleClose={handleClose}
        onSubmit={handleAddDocument}
        refetch={refetch} // <-- Pass refetch here
      />
      <PreviewImg previewOpen={previewOpen} setPreviewOpen={setPreviewOpen} previewSrc={previewSrc} />

      {/* DeleteDialogBox removed. You may want to implement a different confirmation dialog here. */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
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

export default DocumentList;