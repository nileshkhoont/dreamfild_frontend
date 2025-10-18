import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { MdInventory2, MdAddBox, MdAssignmentReturn } from "react-icons/md"; // update import
import { Search } from "lucide-react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TableSortLabel from "@mui/material/TableSortLabel";
import { useNavigate } from "react-router-dom";
import AddAssetForm from "./AddAssetForm";
import { useGetAssetsQuery, useDeleteAssetMutation } from "../../API/assets"; // <-- import delete hook
import DeleteDialogBox from "../DeleteDialogBox"; // <-- import dialog
import PreviewImg from "../Profile/PreviewImg";
import { CustomLoader } from "../Layout/CustomLoader";

const Container = styled(Box)({
  // maxWidth: 1400,
  margin: "0 auto",
  paddingTop: "2rem",
});

// Make toggle button smaller and more compact - same as AssignAssetList
const ToggleButtonGroup = styled(Box)({
  display: "flex",
  backgroundColor: "#f5f5f5",
  borderRadius: "30px",
  gap: "4px",
  padding: "3px",
  border: "1px solid #e0e0e0",
});

const ToggleButton = styled(Button)(({ isActive }) => ({
  borderRadius: "30px", // Reduced from 8px
  padding: "4px 8px", // Reduced from 8px 16px
  textTransform: "none",
  fontWeight: 500,
  fontSize: "12px", // Reduced from 14px
  minWidth: "80px", // Reduced from 120px
  backgroundColor: isActive ? "var(--purpleShadeBg)" : "transparent",
  color: isActive ? "white" : "#666",
  border: "none",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: isActive ? "var(--purpleShadeBg)" : "rgba(0, 0, 0, 0.04)",
    boxShadow: "none",
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  border: "none",
  "& .MuiTableCell-head": {
    backgroundColor: "var(--tableHeaderBackgroundColor)",
    fontWeight: 600,
    color: "var(--textColor)",
    borderBottom: "none",
  },
  "& .MuiTableCell-root": {
    borderBottom: "none",
    borderRight: "none",
    fontSize: "15px", // Add this line for all table cells
  },
  "& .MuiTableRow-root:hover": {
    backgroundColor: "var(--hoverBackgroundColor)",
    transition: "background-color 0.3s ease",
  },
}));

const StatusBadge = styled(Box)(({ theme, status }) => {
  const normalized = (status || "").toLowerCase();
  let bgColor = alpha("#0046f6", 0.1);
  let color = "#0046f6";

  if (normalized === "in stock") {
    bgColor = alpha(theme.palette.success.main, 0.15);
    color = theme.palette.success.main;
  } else if (normalized === "out of stock") {
    bgColor = alpha(theme.palette.error.main, 0.1);
    color = theme.palette.error.main;
  }

  return {
    padding: "6px 12px",
    borderRadius: 20,
    fontWeight: 500,
    display: "inline-block",
    backgroundColor: bgColor,
    color: color,
    textTransform: "capitalize",
    minWidth: 80,
    textAlign: "center",
  };
});

const AssetList = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("name");
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openAddDialog, setOpenAddDialog] = React.useState(false);
  const [editAsset, setEditAsset] = React.useState(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState("");

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedAsset, setSelectedAsset] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const navigate = useNavigate();

  // Get user from localStorage
  const loggedInUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  // API hooks
  const { data, isLoading, isError } = useGetAssetsQuery();
  const [deleteAsset] = useDeleteAssetMutation();

  // Extract assets array from API response
  const assets = data?.responseData?.assets || [];

  // Filter assets based on search
  const filteredAssets = React.useMemo(() => {
    if (!searchTerm.trim()) return assets;
    return assets.filter(
      (asset) =>
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.userId?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [assets, searchTerm]);

  // Sorting logic
  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  }
  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Snackbar close handler
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Add this function to show backend message
  const handleSuccess = () => {
  };

  // Menu handling functions
  const handleMenuOpen = (event, asset) => {
    setAnchorEl(event.currentTarget);
    setSelectedAsset(asset);
    console.log("Selected asset:", asset); // Add this to verify asset is set
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Only clear selectedAsset if deleteDialogOpen is false
    if (!deleteDialogOpen) {
      setSelectedAsset(null);
    }
  };

  const handleEditFromMenu = () => {
    setEditAsset(selectedAsset);
    setOpenAddDialog(true);
    handleMenuClose();
  };

  const handleDeleteFromMenu = () => {
    setDeleteDialogOpen(true);
    // Just close the menu, don't clear selectedAsset
    setAnchorEl(null);
  };

  const handleViewFromMenu = () => {
    if (selectedAsset?.image) {
      setPreviewSrc(selectedAsset.image);
      setPreviewOpen(true);
    }
    handleMenuClose();
  };

  // Delete dialog handlers
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedAsset(null);
  };

  const handleConfirmDelete = async () => {
    console.log("handleConfirmDelete called, asset:", selectedAsset);
    if (!selectedAsset?._id) {
      console.error("No asset ID found!");
      setSnackbar({
        open: true,
        message: "Cannot delete: Asset ID not found",
        severity: "error",
      });
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      return;
    }

    setIsDeleting(true);
    try {
      console.log("Attempting to delete asset with ID:", selectedAsset._id);
      const res = await deleteAsset(selectedAsset._id).unwrap();
      console.log("Delete response:", res);

      setSnackbar({
        open: true,
        message: res?.responseMessage || "Asset deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Delete error:", err);
      setSnackbar({
        open: true,
        message: err?.data?.responseMessage || "Failed to delete asset.",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedAsset(null);
    }
  };


  if (isLoading) {
    return (
      <Container>
        <Box
          sx={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <CustomLoader />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      {/* Toggle Button Group outside the Card */}


      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          color: "var(--textColor)",
          pt: 0.9,
          minHeight: "calc(100vh - 200px)",
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
              {/* Title */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <MdInventory2 size={22} color="var(--textColor)" />
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
                    Asset List
                  </Typography>
                </Box>
                {loggedInUser?.role !== "user" && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                    
                    }}
                  >
                    <ToggleButtonGroup>
                      <ToggleButton
                        isActive={true} // This page is active
                        onClick={() => { }} // No action needed for current page
                      >
                        Assets
                      </ToggleButton>
                      <ToggleButton
                        isActive={false}
                        onClick={() => navigate("/assign-assets")}
                      >
                        Assigned
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                )}
              </Box>

              {/* Search and Add Button */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  flexWrap: "nowrap",
                  width: "100%",
                }}
              >
                <Box sx={{ minWidth: 200, maxWidth: 350, width: 250 }}>
                  <TextField
                    placeholder="Search assets"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search size={18} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: "100%",
                      height: "40px",
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
                      "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--textFieldFocusBorderColor, #343a40)",
                        borderWidth: 1,
                      },
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{
                    backgroundColor: "white", color: "var(--purpleShadeBg)",
                    borderRadius: "5px",
                    fontWeight: 600,
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
                  onClick={() => setOpenAddDialog(true)}
                >
                  + Add Asset
                </Button>
              </Box>
            </Box>
          }
        />
        <CardContent sx={{ flexGrow: 1, pb: 3, display: "flex", flexDirection: "column" }}>
          {/* Fixed Table Header */}
          <StyledTableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "16px 16px 0 0", // Only top corners rounded
              marginBottom: 0,
            }}
          >
            <Table sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sortDirection={orderBy === "name" ? order : false}
                    sx={{ 
                      py: 1.5, 
                      fontWeight: 600, 
                      fontSize: 14,
                      backgroundColor: "var(--tableHeaderBackgroundColor)",
                      borderBottom: "1px solid #e0e0e0",
                      width: "18%"
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={(e) => handleRequestSort(e, "name")}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={orderBy === "category" ? order : false}
                    sx={{ 
                      py: 1.5, 
                      fontWeight: 600, 
                      fontSize: 14,
                      backgroundColor: "var(--tableHeaderBackgroundColor)",
                      borderBottom: "1px solid #e0e0e0",
                      width: "13%"
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "category"}
                      direction={orderBy === "category" ? order : "asc"}
                      onClick={(e) => handleRequestSort(e, "category")}
                    >
                      Category
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={orderBy === "totalQuantity" ? order : false}
                    sx={{ 
                      py: 1.5, 
                      fontWeight: 600, 
                      fontSize: 14,
                      backgroundColor: "var(--tableHeaderBackgroundColor)",
                      borderBottom: "1px solid #e0e0e0",
                      width: "13%"
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "totalQuantity"}
                      direction={orderBy === "totalQuantity" ? order : "asc"}
                      onClick={(e) => handleRequestSort(e, "totalQuantity")}
                    >
                      Total Quantity
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={orderBy === "totalAssignedQuantity" ? order : false}
                    sx={{ 
                      py: 1.5, 
                      fontWeight: 600, 
                      fontSize: 14,
                      backgroundColor: "var(--tableHeaderBackgroundColor)",
                      borderBottom: "1px solid #e0e0e0",
                      width: "15%"
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "totalAssignedQuantity"}
                      direction={orderBy === "totalAssignedQuantity" ? order : "asc"}
                      onClick={(e) => handleRequestSort(e, "totalAssignedQuantity")}
                    >
                      Assigned Quantity
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ 
                    py: 1.5, 
                    fontWeight: 600, 
                    fontSize: 14,
                    backgroundColor: "var(--tableHeaderBackgroundColor)",
                    borderBottom: "1px solid #e0e0e0",
                    width: "15%"
                  }}>
                    Remaining Quantity
                  </TableCell>
                  <TableCell sx={{ 
                    py: 1.5, 
                    fontWeight: 600, 
                    fontSize: 14,
                    backgroundColor: "var(--tableHeaderBackgroundColor)",
                    borderBottom: "1px solid #e0e0e0",
                    width: "13%"
                  }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ 
                    py: 1.5, 
                    fontWeight: 600, 
                    fontSize: 14,
                    backgroundColor: "var(--tableHeaderBackgroundColor)",
                    borderBottom: "1px solid #e0e0e0",
                    width: "13%"
                  }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </StyledTableContainer>

          {/* Scrollable Table Body */}
          <StyledTableContainer
            component={Paper}
            elevation={0}
            sx={{ 
              height: "calc(100vh - 350px)", // Adjust height based on your layout
              maxHeight: "calc(100vh - 350px)",
              overflowY: "auto", // Enable vertical scrolling
              overflowX: "hidden", // Hide horizontal scroll
              flexGrow: 1,
              borderRadius: "0 0 16px 16px", // Only bottom corners rounded
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(0,0,0,0.1)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0,0,0,0.3)",
                borderRadius: "10px",
                "&:hover": {
                  background: "rgba(0,0,0,0.5)",
                },
              },
            }}
          >
            <Table sx={{ tableLayout: "fixed" }}>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ color: "red", py: 6 }}>
                      Failed to load assets.
                    </TableCell>
                  </TableRow>
                ) : filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                          flexGrow: 1,
                          width: "100%",
                        }}
                      >
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
                          <MdInventory2 size={28} color="#757575" />
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{ color: "#666", width: "100%", textAlign: "center" }}
                        >
                          No assets found matching your search criteria
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets
                    .slice()
                    .sort(getComparator(order, orderBy))
                    .map((asset) => (
                      <TableRow hover tabIndex={-1} key={asset._id}>
                        <TableCell sx={{ py: 1.5, fontSize: 15, width: "18%" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {asset.image ? (
                              <img
                                src={asset.image}
                                alt={asset.name}
                                style={{
                                  width: 26,
                                  height: 26,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                  border: "1px solid #eee",
                                  marginRight: 8,
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  setPreviewSrc(asset.image);
                                  setPreviewOpen(true);
                                }}
                              />
                            ) : (
                              <span
                                style={{
                                  width: 26,
                                  height: 26,
                                  display: "inline-block",
                                  marginRight: 8,
                                }}
                              />
                            )}
                            <span style={{ fontWeight: 500 }}>{asset.name}</span>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: 15, width: "13%" }}>{asset.category}</TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: 15, width: "13%" }}>{asset.totalQuantity}</TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: 15, width: "15%" }}>{asset.totalAssignedQuantity}</TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: 15, width: "15%" }}>
                          {typeof asset.remainingQuantity === "number" ? asset.remainingQuantity : "-"}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: 15, width: "13%" }}>
                          <StatusBadge status={asset.outOfStock ? "Out of Stock" : "In Stock"}>
                            {asset.outOfStock ? "Out of Stock" : "In Stock"}
                          </StatusBadge>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, width: "13%" }}>
                          <IconButton
                            aria-label="more actions"
                            size="small"
                            sx={{ color: "var(--textColor)" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuOpen(e, asset);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </CardContent>

        {openAddDialog && (
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

              if (e.target === e.currentTarget) {
                setOpenAddDialog(false);
                setEditAsset(null);
              }
            }}
          >
            <Box
              sx={{
                backgroundColor: "white",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "90vh",
                p: 4,
                borderRadius: 3,
                position: "relative",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MdInventory2 size={20} color="var(--textColor)" />
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#1f2937",
                    }}
                  >
                    {editAsset ? "Edit Asset" : "Add Asset"}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => {
                    setOpenAddDialog(false);
                    setEditAsset(null);
                  }}
                  sx={{
                    color: "#6b7280",
                    fontSize: "20px",
                    p: 0.5,
                    width: 32,
                    height: 32,
                    "&:hover": {
                      color: "#000",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  ×
                </IconButton>
              </Box>
              <Box className="modal-scrollable-content">
                <AddAssetForm
                  asset={editAsset}
                  onSuccess={handleSuccess}
                  onClose={() => {
                    setOpenAddDialog(false);
                    setEditAsset(null);
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              minWidth: 140,
              p: 0,
            },
          }}
        >
          <MenuItem onClick={handleEditFromMenu}>
            <EditIcon fontSize="small" sx={{ color: "#1976d2", mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDeleteFromMenu}>
            <DeleteIcon fontSize="small" sx={{ color: "var(--redShadeColor)", mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <DeleteDialogBox
          deleteDialogOpen={deleteDialogOpen}
          handleCancelDelete={handleCancelDelete}
          handleConfirmDelete={handleConfirmDelete}
          isDeleting={isDeleting}
          name={selectedAsset?.name}
          message={<>This will permanently delete the <b>{selectedAsset?.name}</b> asset.</>}
          confirmText="Delete"
        />

        <PreviewImg
          previewOpen={previewOpen}
          setPreviewOpen={setPreviewOpen}
          previewSrc={previewSrc}
        />
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AssetList;