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
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
} from "@mui/material";
import { ShoppingCart, Eye } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import { useGetOrdersQuery } from "../../apiService";

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

const Orders = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data, isLoading } = useGetOrdersQuery({ 
    page: page + 1, 
    limit: rowsPerPage 
  });

  const orders = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const handleChangePage = (event, newPage) => setPage(newPage);
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenViewDialog = (order) => {
    setSelectedOrder(order);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedOrder(null);
  };

  // Helper: get dealer name to display under Delivery Partner column
  const getDealerName = (order) => {
    if (!order) return "-";
    const candidate =
      order.dealerName ||
      order.dealer_name ||
      order.dealer?.name ||
      order.dealer?.dealerName ||
      order.dealer?.fullName ||
      (typeof order.dealer === "string" ? order.dealer : undefined) ||
      order.address?.fullName;
    const result = candidate ? String(candidate).trim() : "";
    return result || "-";
  };

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: "warning",
      CONFIRMED: "info",
      PROCESSING: "primary",
      SHIPPED: "secondary",
      DELIVERED: "success",
      CANCELLED: "error",
    };
    return statusColors[status] || "default";
  };

  // Format products for display: show first 2, then "+N more"
  const formatProducts = (products) => {
    if (!products || products.length === 0) return "-";
    
    const firstTwo = products.slice(0, 2);
    const formatted = firstTwo.map(p => `${p.productName} × ${p.quantity}`).join(", ");
    
    if (products.length > 2) {
      return {
        text: formatted,
        more: `+${products.length - 2} more`,
        hasMore: true
      };
    }
    
    return { text: formatted, hasMore: false };
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
              <ShoppingCart size={22} color="var(--textColor)" />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "var(--textColor)",
                  fontSize: "22px",
                }}
              >
                Orders List
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
          ) : orders.length === 0 ? (
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
              <ShoppingCart size={48} color="#ccc" />
              <Typography variant="body1" sx={{ color: "#666" }}>
                No orders found
              </Typography>
            </Box>
          ) : (
            <>
              <StyledTableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Dealer</TableCell>
                      <TableCell>Total Amount</TableCell>
                      <TableCell>Delivery Partner</TableCell>
                      <TableCell>Products</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell sx={{ fontWeight: 500 }}>#{order.id}</TableCell>
                        <TableCell>{order.address?.phoneNumber || order.dealer?.phone || order.dealerPhone || "-"}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          ₹{parseFloat(order.totalAmount).toFixed(2)}
                        </TableCell>
                        <TableCell>{getDealerName(order)}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              cursor: "pointer",
                              display: "inline",
                            }}
                            onClick={() => handleOpenViewDialog(order)}
                          >
                            {(() => {
                              const productInfo = formatProducts(order.products);
                              if (typeof productInfo === 'string') {
                                return <Typography component="span">{productInfo}</Typography>;
                              }
                              if (!productInfo.hasMore) {
                                return <Typography component="span">{productInfo.text}</Typography>;
                              }
                              return (
                                <>
                                  <Typography component="span">{productInfo.text} </Typography>
                                  <Typography
                                    component="span"
                                    sx={{
                                      color: "#1976d2",
                                      fontWeight: 500,
                                      "&:hover": {
                                        textDecoration: "underline",
                                      },
                                    }}
                                  >
                                    {productInfo.more}
                                  </Typography>
                                </>
                              );
                            })()}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenViewDialog(order)}
                              sx={{
                                color: "var(--purpleShadeBg)",
                                "&:hover": {
                                  backgroundColor: "rgba(80, 60, 180, 0.1)",
                                },
                              }}
                            >
                              <Eye size={18} />
                            </IconButton>
                          </Tooltip>
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

      {/* View Order Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: 500,
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(80, 60, 180, 0.15)",
            background: "#fff",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 22,
            color: "var(--purpleShadeBg)",
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <ShoppingCart size={22} />
          Order Details - #{selectedOrder?.id}
          <IconButton
            onClick={handleCloseViewDialog}
            size="small"
            sx={{ ml: "auto", color: "inherit" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
            px: 3,
            py: 1.5,
          }}
        >
          {selectedOrder && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Order Information Card */}
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  border: "1px solid #e0e0e0",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "var(--purpleShadeBg)",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    Order Information
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" sx={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                        Order ID
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 500, fontSize: "15px" }}>
                        #{selectedOrder.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" sx={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                        Status
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={selectedOrder.status}
                          color={getStatusColor(selectedOrder.status)}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 600,
                            fontSize: "12px",
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" sx={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                        Total Amount
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 600, fontSize: "16px", color: "var(--purpleShadeBg)" }}>
                        ₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" sx={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                        Delivery Partner
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 500, fontSize: "15px" }}>
                        {getDealerName(selectedOrder)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                        Created At
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 500, fontSize: "14px", color: "#555" }}>
                        {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "-"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Customer Information Card */}
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  border: "1px solid #e0e0e0",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "var(--purpleShadeBg)",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    Customer Information
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid item xs={6} md={4}>
                      <Typography variant="caption" sx={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                        Full Name
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 500, fontSize: "15px" }}>
                        {selectedOrder.address?.fullName || "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <Typography variant="caption" sx={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                        Phone Number
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 500, fontSize: "15px" }}>
                        {selectedOrder.address?.phoneNumber || "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <Typography variant="caption" sx={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                        City
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 500, fontSize: "15px" }}>
                        {selectedOrder.address?.city || "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <Typography variant="caption" sx={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                        State
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 500, fontSize: "15px" }}>
                        {selectedOrder.address?.state || "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                        Address
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontWeight: 400, fontSize: "14px", color: "#555", lineHeight: 1.6 }}>
                        {`${selectedOrder.address?.addressLine1 || ""} ${selectedOrder.address?.addressLine2 || ""}`.trim() || "-"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Products */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "var(--purpleShadeBg)",
                    mb: 2,
                  }}
                >
                  Products ({selectedOrder.products?.length || 0})
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Price</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.products?.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.productName}</TableCell>
                          <TableCell align="right">{product.quantity}</TableCell>
                          <TableCell align="right">₹{parseFloat(product.price).toFixed(2)}</TableCell>
                          <TableCell align="right">
                            ₹{(parseFloat(product.price) * product.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 600, fontSize: "16px" }}>
                          Total:
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: "16px" }}>
                          ₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseViewDialog}
            sx={{
              backgroundColor: "var(--purpleShadeBg)",
              color: "#fff",
              borderRadius: "12px",
              padding: "8px 24px",
              fontWeight: 600,
              fontSize: 15,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "var(--purpleShadeBg)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders;
