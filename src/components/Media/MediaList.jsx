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
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useGetMediaQuery, useUpdateMediaStatusMutation, useUploadMediaMutation } from "../../apiService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Container = styled(Box)({
  margin: "0 auto",
  paddingTop: "2rem",
  height: "88vh",
  display: "flex",
  flexDirection: "column",
});
const StyledTableContainer = styled(TableContainer)({
  borderRadius: 16,
  border: "none",
  maxHeight: "65vh",
  overflow: "auto",
  "& .MuiTableCell-head": {
    backgroundColor: "var(--tableHeaderBackgroundColor)",
    fontWeight: 600,
    color: "var(--textColor)",
    borderBottom: "none",
    position: "sticky",
    top: 0,
    zIndex: 2,
  },
  "& .MuiTableCell-root": { borderBottom: "none", borderRight: "none" },
  "& .MuiTableRow-root:hover": {
    backgroundColor: "#f5f5f5",
    transition: "background-color 0.3s ease",
  },
});
const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    minWidth: 180,
    padding: theme.spacing(1),
  },
}));

const MediaList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const fileInputRef = React.useRef();

  const { data, isLoading, refetch } = useGetMediaQuery({ page: page + 1, limit: rowsPerPage });
  const [updateMediaStatus] = useUpdateMediaStatusMutation();

  const mediaList = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenMenu = (event, mediaId) => {
    setAnchorEl(event.currentTarget);
    setSelectedMediaId(mediaId);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedMediaId(null);
  };

  const handleStatusChange = async (mediaId, newStatus) => {
    setStatusLoading(true);
    try {
      await updateMediaStatus({ id: mediaId, status: newStatus }).unwrap();
      toast.success("Status changed successfully!");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update status");
    }
    setStatusLoading(false);
    handleCloseMenu();
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("url", "");
      await uploadMedia(formData).unwrap();
      toast.success("Media uploaded successfully!");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to upload media");
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleUploadButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <Container>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          color: "#000",
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardHeader
          title={
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#000",
                textAlign: "left",
                fontSize: "22px",
              }}
            >
              Media List
            </Typography>
          }
          action={
            <>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#000",
                  color: "#fff",
                  borderRadius: 2,
                  textTransform: "none",
                }}
                onClick={handleUploadButtonClick}
                disabled={isUploading}
              >
                Upload Media
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileInputChange}
                accept="*"
              />
            </>
          }
        />
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <StyledTableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>File Name</TableCell>
                      <TableCell>URL</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mediaList.map((media) => (
                      <TableRow key={media.id}>
                        <TableCell>{media.fileName}</TableCell>
                        <TableCell>
                          <a href={media.url} target="_blank" rel="noopener noreferrer">
                            {media.url}
                          </a>
                        </TableCell>
                        <TableCell>{media.status}</TableCell>
                        <TableCell>{media.createdAt ? new Date(media.createdAt).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>
                          <IconButton onClick={(event) => handleOpenMenu(event, media.id)}>
                            <MoreVertIcon />
                          </IconButton>
                          <StyledMenu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedMediaId === media.id}
                            onClose={handleCloseMenu}
                            elevation={3}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "right",
                            }}
                          >
                            <MenuItem
                              onClick={() =>
                                handleStatusChange(
                                  media.id,
                                  media.status === "active" ? "deactive" : "active"
                                )
                              }
                              sx={{
                                borderRadius: 2,
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                              disabled={statusLoading}
                            >
                              <Switch
                                checked={media.status === "active"}
                                color="success"
                                size="small"
                                sx={{ mr: 1 }}
                                inputProps={{ "aria-label": "status switch" }}
                                disabled={statusLoading}
                              />
                              {media.status === "active" ? "Make Deactive" : "Make Active"}
                            </MenuItem>
                          </StyledMenu>
                        </TableCell>
                      </TableRow>
                    ))}
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
                rowsPerPageOptions={[5, 10, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default MediaList;