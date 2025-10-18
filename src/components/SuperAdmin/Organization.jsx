import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  IconButton,
  TableSortLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { X } from "lucide-react";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import AddOrgForm from "./AddOrgForm";
import ViewOrgDetails from "./ViewOrgDetails";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import VisibilityIcon from "@mui/icons-material/Visibility";

import {
  useGetAllOrganizationsQuery,
  useEditOrganizationMutation,
  useToggleOrganizationStatusMutation,
  useSoftDeleteOrganizationMutation,
} from "../../API/organization";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Switch from "@mui/material/Switch";
import { CustomLoader, LoaderContainer } from "../Layout/CustomLoader";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { Search } from "lucide-react";
import DeleteDialogBox from "../DeleteDialogBox"; // Add this import at the top

const Container = styled(Box)({
  maxWidth: 1400,
  margin: "0 auto",
  padding: "2rem",
});

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

// Add these sorting utility functions
const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

const Organization = () => {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [orgToEdit, setOrgToEdit] = React.useState(null);
  const [toggleOrganizationStatus] = useToggleOrganizationStatusMutation();
  const [softDeleteOrganization] = useSoftDeleteOrganizationMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [orgToDelete, setOrgToDelete] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedMenuOrg, setSelectedMenuOrg] = React.useState(null);
  const [sortOrder, setSortOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("name");
  const [order, setOrder] = useState('asc');

  // Fetch organizations from API
  const { data, isLoading, isError, error } = useGetAllOrganizationsQuery();
  React.useEffect(() => {
    if (data) {
      console.log("Organizations API response:", data);
    }
    if (isError) {
      console.error("Error fetching organizations:", error);
    }
  }, [data, isError, error]);

  // Use API data or fallback to empty array
  const organizations = data?.responseData || [];

  // Filter organizations based on search term (name, industry, registrationNumber, type)
  const filteredOrganizations = React.useMemo(() => {
    if (!searchTerm.trim()) return organizations;
    const term = searchTerm.toLowerCase();
    return organizations.filter(
      (org) =>
        org.name?.toLowerCase().includes(term) ||
        org.industry?.toLowerCase().includes(term) ||
        org.registrationNumber?.toLowerCase().includes(term) ||
        org.organizationType?.toLowerCase().includes(term)
    );
  }, [organizations, searchTerm]);

  // Sort organizations based on selected order and orderBy field
  const sortedOrganizations = React.useMemo(() => {
    return stableSort(filteredOrganizations, getComparator(sortOrder, orderBy));
  }, [filteredOrganizations, sortOrder, orderBy]);

  // Open edit dialog with selected org
  const handleEditOrganization = (org) => {
    setOrgToEdit(org);
    setEditDialogOpen(true);
  };

  const handleToggleActive = async (org) => {
    try {
      // Ensure isDisabled is always a boolean
      const isDisabled =
        typeof org.isDisabled === "boolean" ? !org.isDisabled : true;
      console.log(
        "Toggling organization:",
        org._id,
        "isDisabled:",
        isDisabled,
        "original:",
        org.isDisabled
      );
      const response = await toggleOrganizationStatus({
        organizationId: org._id,
        isDisabled,
      }).unwrap();
      setSnackbar({
        open: true,
        message:
          response?.responseMessage || response?.message || "Status updated.",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err?.data?.responseMessage ||
          err?.data?.message ||
          "Failed to update status.",
        severity: "error",
      });
    }
  };

  const handleDeleteOrganization = (org) => {
    setOrgToDelete(org);
    setDeleteDialogOpen(true);
  };

  // Update confirmDeleteOrganization to include org name in the snackbar message
  const confirmDeleteOrganization = async () => {
    if (!orgToDelete) return;
    try {
      const response = await softDeleteOrganization({
        organizationId: orgToDelete._id,
      }).unwrap();
      setSnackbar({
        open: true,
        message:
          response?.responseMessage ||
          `Organization "${orgToDelete.name}" deleted successfully.`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err?.data?.responseMessage ||
          `Failed to delete organization "${orgToDelete.name}".`,
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setOrgToDelete(null);
    }
  };

  const handleMenuOpen = (event, org) => {
    setAnchorEl(event.currentTarget);
    setSelectedMenuOrg(org);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMenuOrg(null);
  };

  const handleMenuView = () => {
    setOrgToEdit(selectedMenuOrg);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleMenuEdit = () => {
    setOrgToEdit(selectedMenuOrg);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleMenuDelete = () => {
    handleDeleteOrganization(selectedMenuOrg);
    handleMenuClose();
  };

  // Sorting handler
  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  if (isLoading) {
    return (
      <LoaderContainer>
        <CustomLoader />
      </LoaderContainer>
    );
  }

  return (
    <Container sx={{ paddingLeft: 0, paddingRight: 0, padding: "2rem 0" }}>
      {/* Organization List Card */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          color: "var(--textColor)",
        }}
      >
        <CardHeader
          title={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                justifyContent: "flex-start",
              }}
            >
              <BusinessOutlinedIcon
                sx={{ color: "var(--textColor)", fontSize: 22 }}
              />
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
                Organization List
              </Typography>
            </Box>
          }
        />

        {/* Search Bar and Add Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
            px: 3,
            pb: 2,
          }}
        >
         <Box sx={{ minWidth: 200, flex: 1, maxWidth: 230 }}>
            <TextField
              placeholder="Search by name"
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
              backgroundColor: "var(--purpleShadeBg)",
              color: "white",
              borderRadius: "12px",
              fontWeight: 500,
              fontSize: "14px",
              textTransform: "none",
              px: 2,
              py: 1,
              height: "40px",
              minWidth: "160px",
              boxShadow: "none",
              "&:hover": {
                  boxShadow: "none",
              },
            }}
            onClick={() => setAddDialogOpen(true)}
          >
            + Add Organization
          </Button>
        </Box>

        <CardContent>
          <StyledTableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleRequestSort('name')}
                      sx={{
                        '&.MuiTableSortLabel-root': {
                          color: 'var(--textColor)',
                          '&:hover': {
                            color: 'var(--textColor)',
                          },
                          '&.Mui-active': {
                            color: 'var(--textColor)',
                            '& .MuiTableSortLabel-icon': {
                              color: 'var(--textColor)',
                            },
                          },
                        },
                      }}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'industry'}
                      direction={orderBy === 'industry' ? order : 'asc'}
                      onClick={() => handleRequestSort('industry')}
                      sx={{
                        '&.MuiTableSortLabel-root': {
                          color: 'var(--textColor)',
                          '&:hover': {
                            color: 'var(--textColor)',
                          },
                          '&.Mui-active': {
                            color: 'var(--textColor)',
                            '& .MuiTableSortLabel-icon': {
                              color: 'var(--textColor)',
                            },
                          },
                        },
                      }}
                    >
                      Industry
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'registrationNumber'}
                      direction={orderBy === 'registrationNumber' ? order : 'asc'}
                      onClick={() => handleRequestSort('registrationNumber')}
                      sx={{
                        '&.MuiTableSortLabel-root': {
                          color: 'var(--textColor)',
                          '&:hover': {
                            color: 'var(--textColor)',
                          },
                          '&.Mui-active': {
                            color: 'var(--textColor)',
                            '& .MuiTableSortLabel-icon': {
                              color: 'var(--textColor)',
                            },
                          },
                        },
                      }}
                    >
                      Registration No.
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'organizationType'}
                      direction={orderBy === 'organizationType' ? order : 'asc'}
                      onClick={() => handleRequestSort('organizationType')}
                      sx={{
                        '&.MuiTableSortLabel-root': {
                          color: 'var(--textColor)',
                          '&:hover': {
                            color: 'var(--textColor)',
                          },
                          '&.Mui-active': {
                            color: 'var(--textColor)',
                            '& .MuiTableSortLabel-icon': {
                              color: 'var(--textColor)',
                            },
                          },
                        },
                      }}
                    >
                      Organization Type
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrganizations.length > 0 ? (
                  stableSort(filteredOrganizations, getComparator(order, orderBy))
                    .map((org) => (
                      <TableRow key={org._id}>
                        <TableCell>{org.name}</TableCell>
                        <TableCell>{org.industry}</TableCell>
                        <TableCell>
                          {org.registrationNumber &&
                          org.registrationNumber.length > 12
                            ? org.registrationNumber.slice(0, 12) + "…"
                            : org.registrationNumber}
                        </TableCell>
                        <TableCell>{org.organizationType}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            aria-label="more actions"
                            size="small"
                            sx={{ color: "var(--textColor)" }}
                            onClick={(e) => handleMenuOpen(e, org)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Switch
                            checked={!org.isDisabled}
                            color="primary"
                            size="small"
                            onChange={() => handleToggleActive(org)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{
                        color: "var(--grayShadeColor)",
                        fontWeight: 600,
                        fontSize: 20,
                        py: 6,
                        background: "rgba(0,0,0,0.02)",
                        letterSpacing: 1,
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 1.5,
                            opacity: 0.8,
                          }}
                        >
                          <BusinessOutlinedIcon
                            sx={{
                              color: "var(--grayShadeColor)",
                              fontSize: 24,
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="center"
                        >
                          {searchTerm.trim()
                            ? "No organizations found matching your search criteria."
                            : "No organizations found."}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </CardContent>
      </Card>
      {addDialogOpen && (
        <AddOrgForm open={addDialogOpen} onSuccess={() => setAddDialogOpen(false)} />
      )}
  
      
        {orgToEdit && (
          <ViewOrgDetails
            org={orgToEdit}
            onSuccess={() => {
              setEditDialogOpen(false);
              setOrgToEdit(null);
            }}
          />
        )}
     
    <DeleteDialogBox
        deleteDialogOpen={deleteDialogOpen}
        handleCancelDelete={() => {
          setDeleteDialogOpen(false);
          setOrgToDelete(null);
        }}
        handleConfirmDelete={confirmDeleteOrganization}
        isDeleting={false}
        name={orgToDelete?.name}
      />
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MuiAlert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            minWidth: 140,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* <MenuItem onClick={handleMenuView}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" sx={{ color: "var(--purpleShadeBg)" }} />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem> */}
        <MenuItem onClick={handleMenuEdit}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" sx={{ color: '#1976d2' }} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'var(--redShadeColor)' }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Organization;
