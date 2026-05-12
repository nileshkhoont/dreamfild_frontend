import React, { useState, useEffect } from "react";
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
  IconButton,
  Collapse,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Package,
  Receipt,
  Search,
} from "lucide-react";
import { useGetTallyOrdersQuery } from "../../apiService";

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

const ExpandableRow = ({ row }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{
              color: "var(--purpleShadeBg)",
              "&:hover": {
                backgroundColor: "rgba(80, 60, 180, 0.1)",
              },
            }}
          >
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 500 }}>{row.date}</TableCell>
        <TableCell sx={{ fontWeight: 500 }}>{row.invoiceNo}</TableCell>
        <TableCell>{row.partyName}</TableCell>
        <TableCell>{row.partyGst}</TableCell>
        <TableCell>
          <Chip
            label={row.voucherNames}
            size="small"
            sx={{
              backgroundColor: "rgba(80, 60, 180, 0.1)",
              color: "var(--purpleShadeBg)",
              fontWeight: 500,
              borderRadius: "8px",
            }}
          />
        </TableCell>
        <TableCell
          align="right"
          sx={{ fontWeight: 600, color: "var(--purpleShadeBg)" }}
        >
          ₹{row.grandTotal}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              {/* Items Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  component="div"
                  sx={{
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "var(--textColor)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Package size={18} />
                  Items
                </Typography>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Item Name
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Actual Qty
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Billed Qty
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Rate
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Amount
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {row.itemArray?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {item.stockItemName}
                          </TableCell>
                          <TableCell align="right">{item.actualQty}</TableCell>
                          <TableCell align="right">{item.billedQty}</TableCell>
                          <TableCell align="right">{item.rate}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            ₹{item.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* GST Section */}
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  component="div"
                  sx={{
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "var(--textColor)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Receipt size={18} />
                  GST Details
                </Typography>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Ledger Name
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Amount
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {row.gstArray?.map((gst, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {gst.ledgerName}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            ₹{gst.ledgerAmount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Narration if available */}
              {row.narration && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "#666", mb: 0.5 }}
                  >
                    Narration:
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#333" }}>
                    {row.narration}
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const TallyOrders = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading } = useGetTallyOrdersQuery({
    page: page + 1,
    limit: rowsPerPage,
    event: "fetch_sales",
    search: debouncedSearch, // ← pass to query
  });

  const orders = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

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
              <FileText size={22} color="var(--textColor)" />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "var(--textColor)",
                  fontSize: "22px",
                }}
                component="span"
              >
                Confirm Orders
              </Typography>
            </Box>
          }
          action={
            <TextField
              size="small"
              placeholder="Search party name or invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                width: 320,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  height: "42px",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--textFieldBorderColor, #ced4da)",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color="#666" />
                  </InputAdornment>
                ),
              }}
            />
          }
        />

        <CardContent
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
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
              <FileText size={48} color="#ccc" />
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
                      <TableCell />
                      <TableCell>Date</TableCell>
                      <TableCell>Invoice No</TableCell>
                      <TableCell>Party Name</TableCell>
                      <TableCell>Party GST</TableCell>
                      <TableCell>Voucher Type</TableCell>
                      <TableCell align="right">Grand Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order, index) => (
                      <ExpandableRow key={index} row={order} />
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

export default TallyOrders;
