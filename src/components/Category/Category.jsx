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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { List, Plus, Edit2, Trash2 } from "lucide-react";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "../../API/category";
import CategoryForm from "./CategoryForm";

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

const Category = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { data, isLoading, refetch } = useGetCategoriesQuery({
    page: page + 1,
    limit: rowsPerPage,
  });

  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const categoryList = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpen = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleClose = () => {
    setEditData(null);
    setOpen(false);
  };

  const handleEdit = (item) => {
    setEditData(item);
    setOpen(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteCategory(itemToDelete.id).unwrap();
      setSnackbar({
        open: true,
        message: "Category deleted successfully!",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to delete",
        severity: "error",
      });
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
                  <List size={22} color="var(--textColor)" />
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
                    Categories
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<Plus size={18} />}
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
                  Add Category
                </Button>
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
          ) : categoryList.length === 0 ? (
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
              <List size={48} color="#ccc" />
              <Typography variant="body1" sx={{ color: "#666" }}>
                No categories found
              </Typography>
            </Box>
          ) : (
            <>
              <StyledTableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell>Updated At</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryList.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                        <TableCell>{item.description || "-"}</TableCell>
                        <TableCell>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {item.updatedAt
                            ? new Date(item.updatedAt).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(item)}
                                sx={{
                                  color: "var(--purpleShadeBg)",
                                  "&:hover": {
                                    backgroundColor: "rgba(80, 60, 180, 0.1)",
                                  },
                                }}
                              >
                                <Edit2 size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(item)}
                                sx={{
                                  color: "#d32f2f",
                                  "&:hover": {
                                    backgroundColor: "rgba(211, 47, 47, 0.1)",
                                  },
                                }}
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            </Tooltip>
                          </Box>
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
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>

      <CategoryForm
        open={open}
        handleClose={handleClose}
        refetch={refetch}
        editData={editData}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: 18,
            color: "#d32f2f",
            pb: 1,
          }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "#666" }}>
            Are you sure you want to delete this category?
          </Typography>
          {itemToDelete && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Name: {itemToDelete.name}
              </Typography>
              {itemToDelete.description && (
                <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                  Description: {itemToDelete.description}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              fontWeight: 600,
              fontSize: 14,
              borderRadius: "10px",
              textTransform: "none",
              color: "var(--textColor)",
              border: "1px solid #e0e0e0",
              padding: "6px 16px",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            sx={{
              backgroundColor: "#d32f2f",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "6px 16px",
              fontWeight: 600,
              fontSize: 14,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#b71c1c",
                boxShadow: "0 2px 8px rgba(211, 47, 47, 0.3)",
              },
            }}
          >
            {isDeleting ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Delete"
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

export default Category;
