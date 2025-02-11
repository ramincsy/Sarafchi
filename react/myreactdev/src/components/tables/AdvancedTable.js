import React, { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Snackbar,
  Alert,
  TablePagination,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import * as XLSX from "xlsx";
import AdvancedTableDesktopView from "./AdvancedTableDesktopView";
import AdvancedTableMobileView from "./AdvancedTableMobileView";

const AdvancedTable = ({
  columns,
  fetchData,
  actions,
  defaultPageSize = 10,

  // کنترل نمایش جستجو، فیلتر وضعیت، فیلتر ستون‌ها و دکمه دانلود
  showSearchTerm = true,
  showStatusFilter = true,
  showColumnsFilter = true,
  showDownload = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // وضعیت داخلی برای جستجو و فیلتر
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((col) => col.field)
  );
  const [openRow, setOpenRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reorderedColumns, setReorderedColumns] = useState(columns);

  // واکشی داده‌ها
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchData();
        // آخرین اطلاعات ابتدا
        const reversed = result.slice();
        setData(reversed);
        setFilteredData(reversed);
      } catch (err) {
        setError("خطا در بارگذاری داده‌ها.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchData]);

  // اگر showSearchTerm=false باشد، searchTerm باید خالی بماند.
  // اگر showStatusFilter=false باشد، statusFilter باید خالی بماند.
  useEffect(() => {
    if (!showSearchTerm) setSearchTerm("");
    if (!showStatusFilter) setStatusFilter("");
  }, [showSearchTerm, showStatusFilter]);

  // فیلتر کردن داده‌ها
  useEffect(() => {
    const handler = setTimeout(() => {
      let temp = data;

      // اگر جستجو فعال است
      if (showSearchTerm && searchTerm) {
        temp = temp.filter((row) =>
          Object.values(row)
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      }

      // اگر فیلتر وضعیت فعال است
      if (showStatusFilter && statusFilter) {
        temp = temp.filter(
          (row) =>
            row["Status"] &&
            row["Status"].toLowerCase() === statusFilter.toLowerCase()
        );
      }

      setFilteredData(temp);
      setPage(0);
    }, 300);

    return () => clearTimeout(handler);
  }, [data, searchTerm, statusFilter, showSearchTerm, showStatusFilter]);

  // مرتب‌سازی داده‌ها
  const sortedData = useMemo(() => {
    const temp = [...filteredData];
    if (!sortConfig.key) {
      // پیشفرض بر اساس تاریخ نزولی
      temp.sort((a, b) => new Date(b.Date) - new Date(a.Date));
    } else {
      temp.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return temp;
  }, [filteredData, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Drag & Drop در دسکتاپ
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(reorderedColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setReorderedColumns(items);
  };

  // دانلود اکسل
  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(sortedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const wbout = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // صفحه‌بندی
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // رنگ پس‌زمینه کارت موبایل
  const getCardBgColor = (status) => {
    switch (status) {
      case "Approved":
      case "Completed":
        return "#d0f0c0";
      case "Rejected":
      case "Canceled":
        return "#f0d0d0";
      case "Pending":
      case "Processing":
        return "#fffacd";
      default:
        return "#ffffff";
    }
  };

  return (
    <Paper sx={{ width: "100%", p: 2, overflowX: "auto" }}>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isMobile ? (
            <AdvancedTableMobileView
              searchTerm={showSearchTerm ? searchTerm : ""}
              setSearchTerm={showSearchTerm ? setSearchTerm : undefined}
              statusFilter={showStatusFilter ? statusFilter : ""}
              setStatusFilter={showStatusFilter ? setStatusFilter : undefined}
              visibleColumns={visibleColumns}
              setVisibleColumns={(visibleColumns) =>
                setVisibleColumns(visibleColumns)
              }
              reorderedColumns={reorderedColumns}
              handleDownload={handleDownload}
              paginatedData={paginatedData}
              actions={actions}
              getCardBgColor={getCardBgColor}
              // props جدید برای کنترل نمایش ستون‌ها و دانلود در موبایل
              showSearchTerm={showSearchTerm}
              showColumnsFilter={showColumnsFilter}
              showDownload={showDownload}
              showStatusFilter={showStatusFilter}
            />
          ) : (
            <AdvancedTableDesktopView
              searchTerm={showSearchTerm ? searchTerm : ""}
              setSearchTerm={showSearchTerm ? setSearchTerm : undefined}
              statusFilter={showStatusFilter ? statusFilter : ""}
              setStatusFilter={showStatusFilter ? setStatusFilter : undefined}
              visibleColumns={visibleColumns}
              setVisibleColumns={(cols) => setVisibleColumns(cols)}
              reorderedColumns={reorderedColumns}
              handleDownload={handleDownload}
              paginatedData={paginatedData}
              actions={actions}
              requestSort={requestSort}
              sortConfig={sortConfig}
              onDragEnd={onDragEnd}
              openRow={openRow}
              setOpenRow={setOpenRow}
              getCardBgColor={getCardBgColor}
              // props جدید برای کنترل نمایش ستون‌ها و دانلود در دسکتاپ
              showSearchTerm={showSearchTerm}
              showColumnsFilter={showColumnsFilter}
              showDownload={showDownload}
              showStatusFilter={showStatusFilter}
            />
          )}
        </>
      )}

      <TablePagination
        component="div"
        count={sortedData.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) =>
          setRowsPerPage(parseInt(e.target.value, 10))
        }
      />
    </Paper>
  );
};

export default AdvancedTable;
