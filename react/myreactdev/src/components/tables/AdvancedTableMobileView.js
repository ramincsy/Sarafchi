// AdvancedTable-MobileView.js
import React from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { CloudDownload as CloudDownloadIcon } from "@mui/icons-material";

const AdvancedTableMobileView = ({
  // برای کنترل بخش‌ها
  showSearchTerm = true,
  showColumnsFilter = true,
  showStatusFilter = true,
  showDownload = true,

  // سایر props اصلی
  searchTerm,
  setSearchTerm,
  visibleColumns,
  setVisibleColumns,
  statusFilter,
  setStatusFilter,
  reorderedColumns,
  handleDownload,
  paginatedData,
  actions,
  getCardBgColor,
}) => {
  return (
    <>
      {/* فیلترهای موبایل */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
        {/* نمایش بخش جستجو فقط اگر showSearchTerm و setSearchTerm فعال باشند */}
        {setSearchTerm && showSearchTerm && (
          <TextField
            label="جستجو"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
          />
        )}

        {/* نمایش فیلتر ستون‌ها فقط اگر showColumnsFilter و setVisibleColumns فعال باشد */}
        {setVisibleColumns && showColumnsFilter && (
          <FormControl size="small" fullWidth>
            <InputLabel>فیلتر کردن ستون ها</InputLabel>
            <Select
              multiple
              value={visibleColumns}
              onChange={(e) => setVisibleColumns(e.target.value)}
              renderValue={() => "فیلتر کردن"}
            >
              {reorderedColumns.map((col) => (
                <MenuItem key={col.field} value={col.field}>
                  <Checkbox checked={visibleColumns.includes(col.field)} />
                  <ListItemText primary={col.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* نمایش فیلتر وضعیت فقط اگر showStatusFilter و setStatusFilter فعال باشند */}
        {setStatusFilter && showStatusFilter && (
          <FormControl size="small" fullWidth>
            <InputLabel>وضعیت</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="وضعیت"
            >
              <MenuItem value="">
                <em>همه</em>
              </MenuItem>
              <MenuItem value="Pending">در حال ارسال</MenuItem>
              <MenuItem value="Approved">تایید شده</MenuItem>
              <MenuItem value="Rejected">رد شده</MenuItem>
              <MenuItem value="Processing">در حال برسی</MenuItem>
              <MenuItem value="Canceled">لغو شده</MenuItem>
              <MenuItem value="Completed">انجام شده</MenuItem>
            </Select>
          </FormControl>
        )}

        {/* نمایش دکمه دانلود اگر showDownload=true باشد */}
        {showDownload && (
          <Button
            variant="contained"
            startIcon={<CloudDownloadIcon />}
            onClick={handleDownload}
          >
            دانلود اکسل
          </Button>
        )}
      </Box>

      {/* نمایش اطلاعات به صورت کارت */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {paginatedData.map((row, idx) => (
          <Card
            key={idx}
            variant="outlined"
            sx={{ p: 1, backgroundColor: getCardBgColor(row.Status) }}
          >
            <CardContent>
              {reorderedColumns
                .filter((col) => visibleColumns.includes(col.field))
                .map((col) => (
                  <Box
                    key={col.field}
                    sx={{ display: "flex", mb: 1, flexWrap: "wrap" }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minWidth: 80, mr: 1 }}
                    >
                      {col.label}:
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {row[col.field]}
                    </Typography>
                  </Box>
                ))}

              {/* مثال: اگر می‌خواهید دکمه‌های عملیات را فقط در حالت Status="Processing" نمایش دهید */}
              {actions && row.Status === "Processing" && (
                <Box sx={{ mt: 1 }}>
                  {typeof actions === "function" ? actions(row) : "عملیات"}
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  );
};

export default AdvancedTableMobileView;
