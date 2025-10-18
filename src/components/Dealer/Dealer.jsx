

import React, { useState } from "react";
import { Card, CardContent, CardHeader, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, styled, TablePagination, CircularProgress } from "@mui/material";
import { Users2, Database } from "lucide-react";
import { useGetDealersQuery } from "../../apiService";

const Container = styled(Box)({
  margin: "0 auto",
  paddingTop: "2rem",
  overflow: "hidden",
});
const StatsGrid = styled(Box)({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "1.5rem",
  marginBottom: "2rem",
  "@media (max-width: 968px)": { gridTemplateColumns: "repeat(1, 1fr)" },
});
const StatCard = styled(Card)({
  background: "#ffffff",
  color: "#0046f6",
  borderRadius: 16,
  boxShadow: "var(--boxShadow)",
});
const IconWrapper = styled(Box)({
  backgroundColor: "var(--backgroundColor)",
  borderRadius: 12,
  padding: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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

const Dealer = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading } = useGetDealersQuery({ page: page + 1, limit: rowsPerPage });
  const dealers = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const activeDealers = dealers.filter((d) => (d.status || "").toLowerCase() === "active");

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container>
      <StatsGrid>
        <StatCard>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconWrapper sx={{ backgroundColor: "#e2dff7" }}>
                <Users2 size={24} color="#8e83f2" />
              </IconWrapper>
              <Box>
                <Typography variant="body2" sx={{ color: "var(--textColor)" }}>
                  Total Dealers
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: "var(--textColor)" }}>
                  {totalCount}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </StatCard>
        <StatCard>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconWrapper sx={{ backgroundColor: "#e2f7e2" }}>
                <Database size={24} color="#4caf50" />
              </IconWrapper>
              <Box>
                <Typography variant="body2" sx={{ color: "var(--textColor)" }}>
                  Active Dealers
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: "var(--textColor)" }}>
                  {activeDealers.length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </StatCard>
      </StatsGrid>
      <Card sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)", color: "var(--textColor)", minHeight: "300px", display: "flex", flexDirection: "column" }}>
        <CardHeader title={<Typography variant="h5" sx={{ fontWeight: 600, color: "var(--textColor)", textAlign: "left", fontSize: "22px" }}>Dealer List</Typography>} />
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <StyledTableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Number</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>GST Number</TableCell>
                      <TableCell>Created At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dealers.map((dealer) => (
                      <TableRow key={dealer.id}>
                        <TableCell>{dealer.displayName}</TableCell>
                        <TableCell>{dealer.email}</TableCell>
                        <TableCell>{dealer.number}</TableCell>
                        <TableCell>{dealer.status}</TableCell>
                        <TableCell>{dealer.gstNumber || '-'}</TableCell>
                        <TableCell>{dealer.createdAt ? new Date(dealer.createdAt).toLocaleDateString() : '-'}</TableCell>
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
    </Container>
  );
};

export default Dealer;
