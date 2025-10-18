import React from "react";
import { TableRow, TableCell, Skeleton } from "@mui/material";

const TableShimmer = ({ columns, rowsPerPage }) => {
  return (
    <>
      {Array.from(new Array(rowsPerPage)).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {columns.map((column) => (
            <TableCell key={column.id}>
              <Skeleton variant="text" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default TableShimmer;