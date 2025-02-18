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

// تابع برای تعیین رنگ پس‌زمینه بر اساس وضعیت
const getTintedBackground = (status) => {
  switch (status) {
    case "Approved":
      return "rgba(144, 238, 144, 0.47)"; // سبز کم‌رنگ
    case "Rejected":
      return "rgba(252, 74, 101, 0.51)"; // صورتی کم‌رنگ
    case "Pending":
    case "Processing":
      return "rgba(253, 253, 1, 0.41)"; // زرد کم‌رنگ
    case "Canceled":
      return "rgba(247, 3, 3, 0.42)"; // خاکستری کم‌رنگ
    case "Completed":
      return "rgba(0, 164, 218, 0.52)"; // آبی کم‌رنگ
    default:
      return "rgba(255, 255, 255, 0.42)"; // رنگ پیش‌فرض شیشه‌ای
  }
};

const AdvancedTableMobileView = ({
  // کنترل بخش‌ها
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
}) => {
  return (
    <>
      {/* بخش فیلترهای موبایل */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
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

      {/* نمایش کارت‌ها به صورت موبایل با افکت شیشه‌ای ترکیبی */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {paginatedData.map((row, idx) => {
          // دریافت رنگ بر اساس وضعیت
          const tinted = getTintedBackground(row.Status);
          // ایجاد گرادیان: از رنگ وضعیت شروع شده و به رنگ شیشه‌ای (نیمه شفاف) ختم می‌شود
          const background = `linear-gradient(135deg, ${tinted} 0%, rgba(255,255,255,0.15) 100%)`;
          return (
            <Card
              key={idx}
              variant="outlined"
              sx={{
                p: 1,
                background: background,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8,
                position: "relative",
              }}
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
                {actions && row.Status === "Processing" && (
                  <Box sx={{ mt: 1 }}>
                    {typeof actions === "function" ? actions(row) : "عملیات"}
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </>
  );
};

export default AdvancedTableMobileView;
