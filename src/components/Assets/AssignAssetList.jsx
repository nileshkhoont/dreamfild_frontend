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
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { MdInventory2 } from "react-icons/md";
import { Search } from "lucide-react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom"; // Add this import
import AssignAssetForm from "./AssignAssetForm";
import { useGetAllAssignedUserAssetsQuery, useDeleteAssignedAssetMutation } from "../../API/assets";
import PreviewImg from "../Profile/PreviewImg";
import { CustomLoader } from "../Layout/CustomLoader";
import DeleteDialogBox from "../DeleteDialogBox";

const Container = styled(Box)({
  margin: "0 auto",
  paddingTop: "2rem",
});

// Make toggle button smaller and more compact
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
  },
  "& .MuiTableRow-root:hover": {
    backgroundColor: "var(--hoverBackgroundColor)",
    transition: "background-color 0.3s ease",
  },
}));

const StatusBadge = styled(Box)(({ theme, status }) => {
  // Normalize status for comparison
  const normalized = (status || "").toLowerCase();
  let bgColor = alpha("#0046f6", 0.1);
  let color = "#0046f6";

  if (normalized === "good") {
    bgColor = alpha(theme.palette.success.main, 0.15);
    color = theme.palette.success.main;
  } else if (normalized === "damaged") {
    bgColor = alpha(theme.palette.error.main, 0.1);
    color = theme.palette.error.main;
  } else if (normalized === "missing") {
    bgColor = alpha("#f59e42", 0.15);
    color = "#f59e42";
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

const AssignAssetList = () => {
  const navigate = useNavigate(); // Add this hook

  // Get user from localStorage
  const loggedInUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  // If user, pass their id; else null for all
  const userId = loggedInUser?.role === "user" ? loggedInUser._id : null;

  const [searchTerm, setSearchTerm] = React.useState("");
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openAssignDialog, setOpenAssignDialog] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState("");
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [editData, setEditData] = React.useState(null);
  const [form, setForm] = React.useState({
    userId: "",
    assetId: "",
    assignedDate: "",
    returnDate: "",
    quantity: 1,
    condition: "Good",
    userReturnCondition: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false); // Add state for delete dialog
  const [isDeleting, setIsDeleting] = React.useState(false); // Add state for delete loading
  const [deleteAssignedAsset] = useDeleteAssignedAssetMutation(); // Add this hook

  const handleMenuOpen = (event, row) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEdit = () => {
    setOpenAssignDialog(true);
    setEditData(selectedRow); // Pass the selected assignment row
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    // Just close the menu, don't clear selectedRow
    setMenuAnchorEl(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedRow(null);
  };

  const handleConfirmDelete = async () => {
    console.log("handleConfirmDelete called, assignment:", selectedRow);
    if (!selectedRow?._id || !selectedRow?.assignment?._id) {
      console.error("No asset or assignment ID found!");
      setSnackbar({
        open: true,
        message: "Cannot delete: Asset or assignment ID not found",
        severity: "error",
      });
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      return;
    }

    setIsDeleting(true);
    try {
      console.log("Attempting to delete assigned asset:", {
        assetId: selectedRow._id,
        assignmentId: selectedRow.assignment._id
      });

      const res = await deleteAssignedAsset({
        assetId: selectedRow._id,
        assignmentId: selectedRow.assignment._id
      }).unwrap();

      console.log("Delete response:", res);

      setSnackbar({
        open: true,
        message: res?.responseMessage || "Asset assignment deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Delete error:", err);
      setSnackbar({
        open: true,
        message: err?.data?.responseMessage || "Failed to delete asset assignment.",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedRow(null);
    }
  };

  // Fetch all assets
  // If you want to filter by user, set userId here (e.g., from props, context, or state)

  const { data, isLoading, isError } = useGetAllAssignedUserAssetsQuery(userId);

  // The API returns { assets: [...] }
  // Only show assets that are assigned (userId is not null)
  const assignedAssets = React.useMemo(() => {
    return data?.responseData?.assets || [];
  }, [data]);

  // Flattened assets to show all assignments for each asset
  const flattenedAssets = React.useMemo(() => {
    // Each asset may have multiple assignments
    return assignedAssets.flatMap((asset) =>
      (asset.assignments || []).map((assignment) => ({
        ...asset,
        assignment, // assignment contains userId, condition, etc.
      }))
    );
  }, [assignedAssets]);

  // Filter assets based on search
  const filteredAssets = React.useMemo(() => {
    if (!searchTerm.trim()) return flattenedAssets;
    return flattenedAssets.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assignment?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assignment?.assetCondition?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flattenedAssets, searchTerm]);

  // Snackbar close handler
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  React.useEffect(() => {
    if (editData) {
      setForm({
        userId: editData.assignment?.userId?._id || "",
        assetId: editData._id || "",
        assignedDate: editData.assignment?.assignedDate || "",
        returnDate: editData.assignment?.returnDate || "",
        quantity: editData.assignment?.quantity || 1,
        condition: editData.assignment?.condition || "Good",
        userReturnCondition: editData.assignment?.returnCondition || "",
      });
    }
  }, [editData]);

  // Show loader before rendering the table if loading
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


      <Card
        sx={{
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          color: "var(--textColor)",
          pt: 0.9,
          minHeight: "calc(100vh - 190px)",
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
              {/* Title without Toggle Button */}
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
                    Assigned Assets
                  </Typography>
                </Box>
                {/* Toggle Button Group outside the Card */}
                {loggedInUser?.role !== "user" && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                    // Add margin-bottom to create spacing between the toggle and the card
                    }}
                  >
                    <ToggleButtonGroup>
                      <ToggleButton
                        isActive={false}
                        onClick={() => navigate("/assets")}
                      >
                        Assets
                      </ToggleButton>
                      <ToggleButton
                        isActive={true}
                        onClick={() => { }}
                      >
                        Assigned
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                )}
              </Box>

              {/* Search and Assign Button */}
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
                    placeholder="Search assigned assets"
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
                {loggedInUser?.role !== "user" && (
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
                    onClick={() => setOpenAssignDialog(true)}
                  >
                    + Assign Asset
                  </Button>
                )}
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
                  <TableCell sx={{ 
                    py: 1.5, 
                    fontWeight: 600,
                    backgroundColor: "var(--tableHeaderBackgroundColor)",
                    borderBottom: "1px solid #e0e0e0",
                    width: "20%"
                  }}>
                    Asset Name
                  </TableCell>
                  <TableCell sx={{ 
                    py: 1.5, 
                    fontWeight: 600,
                    backgroundColor: "var(--tableHeaderBackgroundColor)",
                    borderBottom: "1px solid #e0e0e0",
                    width: "15%"
                  }}>
                    User Name
                  </TableCell>
                  <TableCell sx={{ 
                    py: 1.5, 
                    fontWeight: 600,
                    backgroundColor: "var(--tableHeaderBackgroundColor)",
                    borderBottom: "1px solid #e0e0e0",
                    width: "13%"
                  }}>
                    Assigned Date
                  </TableCell>
                  <TableCell sx={{ 
                    py: 1.5, 
                    fontWeight: 600,
                    backgroundColor: "var(--tableHeaderBackgroundColor)",
                    borderBottom: "1px solid #e0e0e0",
                    width: "12%"
                  }}>
                    Condition
                  </TableCell>
                  <TableCell sx={{ 
                    py: 1.5, 
                    fontWeight: 600,
                    backgroundColor: "var(--tableHeaderBackgroundColor)",
                    borderBottom: "1px solid #e0e0e0",
                    width: "15%"
                  }}>
                    Return Condition
                  </TableCell>
                  <TableCell sx={{ 
                    py: 1.5, 
                    fontWeight: 600,
                    backgroundColor: "var(--tableHeaderBackgroundColor)",
                    borderBottom: "1px solid #e0e0e0",
                    width: "13%"
                  }}>
                    Assigned Qty
                  </TableCell>
                  {loggedInUser?.role !== "user" && (
                    <TableCell sx={{ 
                      py: 1.5, 
                      fontWeight: 600,
                      backgroundColor: "var(--tableHeaderBackgroundColor)",
                      borderBottom: "1px solid #e0e0e0",
                      width: "12%"
                    }}>
                      Actions
                    </TableCell>
                  )}
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
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={loggedInUser?.role !== "user" ? 7 : 6} align="center" sx={{ py: 6 }}>
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
                          No assigned assets found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map((item, idx) => (
                    <TableRow key={item._id + "-" + idx}>
                      <TableCell sx={{ py: 1.5, width: "20%" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "8px",
                              overflow: "hidden",
                              bgcolor: "#f3f3f3",
                              border: "1px solid #eee",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mr: 1,
                            }}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  setPreviewSrc(item.image);
                                  setPreviewOpen(true);
                                }}
                              />
                            ) : (
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  color: "#888",
                                  fontSize: 18,
                                }}
                              >
                                {item.name?.[0]?.toUpperCase() || ""}
                              </Typography>
                            )}
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 500 }}>
                              {item.name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, width: "15%" }}>
                        {item.assignment?.userId?.name || "-"}
                      </TableCell>
                      <TableCell sx={{ py: 1.5, width: "13%" }}>
                        {item.assignment?.assignedDate
                          ? new Date(item.assignment.assignedDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                          : "-"}
                      </TableCell>
                      <TableCell sx={{ py: 1.5, width: "12%" }}>
                        {item.assetCondition || "-"}
                      </TableCell>
                      <TableCell sx={{ py: 1.5, width: "15%" }}>
                        <StatusBadge status={item.assignment?.returnCondition}>
                          {item.assignment?.returnCondition || "-"}
                        </StatusBadge>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, width: "13%" }}>
                        {item.assignment?.quantity ?? "-"}
                      </TableCell>
                      {loggedInUser?.role !== "user" && (
                        <TableCell sx={{ py: 1.5, width: "12%" }}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, item)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </CardContent>

        {/* Assign Asset Modal */}
        {openAssignDialog && (
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
              if (e.target === e.currentTarget) setOpenAssignDialog(false);
            }}
          >
            <Box
              sx={{
                backgroundColor: "white",
                width: "100%",
                maxWidth: "500px",
                p: 4,
                borderRadius: 3,
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <AssignAssetForm
                onClose={() => {
                  setOpenAssignDialog(false);
                  setEditData(null);
                }}

                editData={editData} // Pass editData as prop
              />
            </Box>
          </Box>
        )}

        {/* Preview Image Dialog */}
        <PreviewImg
          previewOpen={previewOpen}
          setPreviewOpen={setPreviewOpen}
          previewSrc={previewSrc}
        />

        {/* Edit/Delete Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
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
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ color: "#1976d2", mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <DeleteIcon fontSize="small" sx={{ color: "var(--redShadeColor)", mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

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

        {/* Delete Confirmation Dialog */}
        <DeleteDialogBox
          deleteDialogOpen={deleteDialogOpen}
          handleCancelDelete={handleCancelDelete}
          handleConfirmDelete={handleConfirmDelete}
          isDeleting={isDeleting}
          name={selectedRow?.name}
          message={
            <>
              This will permanently delete the assignment of <b>{selectedRow?.name}</b> to{" "}
              <b>{selectedRow?.assignment?.userId?.name}</b>.
            </>
          }
          confirmText="Delete"
        />
      </Card>

      {/* ...existing snackbar and other components... */}
    </Container>
  );
};

export default AssignAssetList;