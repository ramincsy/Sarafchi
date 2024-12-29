import React, { useState, useMemo } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import * as XLSX from "xlsx";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const TransactionTable = ({
  rows,
  columns,
  visibleColumns = null,
  columnOrder = null,
  pageSize = 1,
  pageSizeOptions = [5, 10, 20],
  checkboxSelection = true,
  disableSelectionOnClick = true,
  height = 500,
  showSearch = true,
  showDownload = true,
  showActions = true,
}) => {
  const [searchText, setSearchText] = useState("");

  const processedColumns = useMemo(() => {
    let filteredColumns = columns;
    if (visibleColumns) {
      filteredColumns = columns.filter((col) =>
        visibleColumns.includes(col.field)
      );
    }
    if (columnOrder) {
      filteredColumns.sort(
        (a, b) => columnOrder.indexOf(a.field) - columnOrder.indexOf(b.field)
      );
    }
    if (showActions) {
      filteredColumns = [
        ...filteredColumns,
        {
          field: "actions",
          headerName: "عملیات",
          width: 150,
          renderCell: (params) => (
            <Box display="flex" justifyContent="space-around" width="100%">
              <IconButton
                color="primary"
                onClick={() => handleEdit(params.row)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => handleDelete(params.row)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ),
        },
      ];
    }
    return filteredColumns;
  }, [columns, visibleColumns, columnOrder, showActions]);

  const handleEdit = (row) => {
    alert(`ویرایش: ${JSON.stringify(row)}`);
  };

  const handleDelete = (row) => {
    alert(`حذف: ${JSON.stringify(row)}`);
  };

  const handleExportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [processedColumns.map((col) => col.headerName)];

    rows.forEach((row) => {
      const rowData = processedColumns.map((col) => row[col.field]);
      worksheetData.push(rowData);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    XLSX.writeFile(workbook, "transactions.xlsx");
  };

  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [rows, searchText]);

  return (
    <Paper
      sx={{
        height,
        width: "100%",
        overflow: "hidden",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
          backgroundColor: "#f0f0f0",
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          تراکنش‌ها
        </Typography>
        <Box display="flex" gap={2}>
          {showSearch && (
            <TextField
              label="جستجو"
              variant="outlined"
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          )}
          {showDownload && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleExportToExcel}
              startIcon={<CloudDownloadIcon />}
            >
              دانلود
            </Button>
          )}
        </Box>
      </Box>
      <Box sx={{ height: "calc(100% - 56px)", width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={processedColumns}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          checkboxSelection={checkboxSelection}
          disableSelectionOnClick={disableSelectionOnClick}
          components={{ Toolbar: GridToolbar }}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f8f9fa",
              color: "#495057",
              fontWeight: "bold",
              textTransform: "uppercase",
              fontSize: "0.875rem",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#e9ecef",
            },
            "& .MuiDataGrid-cell": {
              fontSize: "0.875rem",
              color: "#212529",
              padding: "8px",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#f8f9fa",
              color: "#495057",
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default TransactionTable;
