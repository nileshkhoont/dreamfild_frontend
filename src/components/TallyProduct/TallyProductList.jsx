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
  Chip,
} from "@mui/material";
import { Package, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetTallyProductsQuery } from "../../apiService";

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

const TallyProductList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const navigate = useNavigate();

  // Add refetchOnMountOrArgChange to ensure fresh data
  const { data, isLoading, refetch } = useGetTallyProductsQuery({ 
    page: page + 1, 
    limit: rowsPerPage 
  }, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true
  });

  const products = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewMore = (product) => {
    // Navigate to variants page with product data
    navigate(`/tally-products/${product.mainProduct}`, { 
      state: { productData: product } 
    });
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Package size={22} color="var(--textColor)" />
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
                Tally Product List
              </Typography>
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
          ) : products.length === 0 ? (
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
              <Package size={48} color="#ccc" />
              <Typography variant="body1" sx={{ color: "#666" }}>
                No products found
              </Typography>
            </Box>
          ) : (
            <>
              <StyledTableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Main Product</TableCell>
                      <TableCell>Variants</TableCell>
                      <TableCell>Price Range</TableCell>
                      <TableCell>Last Updated</TableCell>
                      <TableCell align="center">View More</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 600, fontSize: "16px" }}>
                          {product.mainProduct}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${product.variants?.length || 0} Variants`}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(80, 60, 180, 0.1)",
                              color: "var(--purpleShadeBg)",
                              fontWeight: 500,
                              borderRadius: "8px",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {product.variants?.length > 0 && (
                            <Typography variant="body2" sx={{ color: "#666" }}>
                              ₹{Math.min(...product.variants.map(v => parseFloat(v.price) || 0))} - 
                              ₹{Math.max(...product.variants.map(v => parseFloat(v.price) || 0))}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            {new Date().toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Eye size={16} />}
                            onClick={() => handleViewMore(product)}
                            sx={{
                              borderColor: "var(--purpleShadeBg)",
                              color: "var(--purpleShadeBg)",
                              borderRadius: "8px",
                              fontWeight: 500,
                              fontSize: "12px",
                              textTransform: "none",
                              px: 2,
                              py: 0.5,
                              "&:hover": {
                                backgroundColor: "rgba(80, 60, 180, 0.1)",
                                borderColor: "var(--purpleShadeBg)",
                              },
                            }}
                          >
                            View More
                          </Button>
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
    </Container>
  );
};

export default TallyProductList;