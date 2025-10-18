import React, { useState, useMemo, useEffect } from "react";
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
    TableSortLabel,
    InputAdornment,
    TextField,
    MenuItem,
    CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Search } from "lucide-react";
import { useGetAllOrganizationsQuery, useGetUsersByOrganizationMutation } from "../../API/organization";

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

const OrgUserList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("name");
    const [selectedOrg, setSelectedOrg] = useState("");
    const [users, setUsers] = useState([]);
    const [fetchUsers, { data: usersData, isLoading: usersLoading }] = useGetUsersByOrganizationMutation();

    // Fetch organizations
    const { data, isLoading } = useGetAllOrganizationsQuery();
    const orgOptions = data?.responseData || [];

    // Fetch users when org changes
    useEffect(() => {
        if (selectedOrg) {
            fetchUsers(selectedOrg)
                .unwrap()
                .then((res) => {
                    setUsers(res?.responseData?.users || []);
                })
                .catch(() => setUsers([]));
        } else {
            setUsers([]);
        }
    }, [selectedOrg, fetchUsers]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        const term = searchTerm.toLowerCase();
        return users.filter(
            (user) =>
                user.name?.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term) ||
                user.bloodGroup?.toLowerCase().includes(term) ||
                user.phone?.toLowerCase().includes(term)
        );
    }, [users, searchTerm]);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    return (
        <Container sx={{ paddingLeft: 0, paddingRight: 0, padding: "2rem 0" }}>
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
                            <PersonOutlineIcon sx={{ color: "var(--textColor)", fontSize: 22 }} />
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
                                Organization Users
                            </Typography>
                        </Box>
                    }
                />

                {/* Dropdown and Search Bar */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                        px: 3,
                        pb: 2,
                    }}
                >

                    <TextField
                        select
                        value={selectedOrg}
                        onChange={(e) => setSelectedOrg(e.target.value)}
                        variant="outlined"
                        size="small"
                        SelectProps={{
                            displayEmpty: true,
                            renderValue: (selected) =>
                                selected
                                    ? orgOptions.find((org) => org._id === selected)?.name
                                    : <span style={{ color: "#bdbdbd" }}>Select Organization</span>,
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonOutlineIcon sx={{ fontSize: 18, color: "var(--textFieldIconColor, #bdbdbd)" }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            maxWidth: 230,
                            width: "100%",
                            background: "#fff",
                            borderRadius: "12px",
                            "& .MuiInputBase-root": {
                                fontSize: "14px",
                                borderRadius: "12px",
                                height: "40px",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--textFieldBorderColor, #ced4da)",
                                borderRadius: "12px",
                            },
                            // Remove hover border color change
                            // "&:hover .MuiOutlinedInput-notchedOutline": {
                            //     borderColor: "var(--textFieldBorderColor, #ced4da)",
                            // },
                            "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--textFieldFocusBorderColor, #343a40) !important",
                                borderWidth: 1,
                            },
                            "& .MuiInputBase-root:focus-within .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--textFieldFocusBorderColor, #343a40) !important",
                                borderWidth: 1,
                            },
                        }}
                        disabled={isLoading}
                    >
                        <MenuItem value="" disabled>
                            <span style={{ color: "#bdbdbd" }}>Select Organization</span>
                        </MenuItem>
                        {orgOptions.map((org) => (
                            <MenuItem key={org._id} value={org._id}>
                                {org.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Box sx={{ minWidth: 200, flex: 1, maxWidth: 230 }}>
                        <TextField
                            placeholder="Search by name, email, phone, blood group"
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
                            disabled={!selectedOrg}
                        />
                    </Box>
                </Box>

                <CardContent>
                    {(isLoading || usersLoading) ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <StyledTableContainer component={Paper} elevation={0}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === "name"}
                                                direction={orderBy === "name" ? order : "asc"}
                                                onClick={() => handleRequestSort("name")}
                                            >
                                                Name
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === "email"}
                                                direction={orderBy === "email" ? order : "asc"}
                                                onClick={() => handleRequestSort("email")}
                                            >
                                                Email
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === "phone"}
                                                direction={orderBy === "phone" ? order : "asc"}
                                                onClick={() => handleRequestSort("phone")}
                                            >
                                                Phone Number
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === "bloodGroup"}
                                                direction={orderBy === "bloodGroup" ? order : "asc"}
                                                onClick={() => handleRequestSort("bloodGroup")}
                                            >
                                                Blood Group
                                            </TableSortLabel>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedOrg && filteredUsers.length > 0 ? (
                                        stableSort(filteredUsers, getComparator(order, orderBy)).map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.phone || "-"}</TableCell>
                                                <TableCell>{user.bloodGroup || "-"}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ color: "var(--grayShadeColor)", fontWeight: 600, fontSize: 20, py: 6, background: "rgba(0,0,0,0.02)", letterSpacing: 1, borderRadius: 2 }}>
                                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                                    <Box sx={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)", display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5, opacity: 0.8 }}>
                                                        <PersonOutlineIcon sx={{ color: "var(--grayShadeColor)", fontSize: 24 }} />
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" align="center">
                                                        {!selectedOrg
                                                            ? "Please select an organization to view users."
                                                            : searchTerm.trim()
                                                                ? "No users found matching your search criteria."
                                                                : "No users found for this organization."}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </StyledTableContainer>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default OrgUserList;