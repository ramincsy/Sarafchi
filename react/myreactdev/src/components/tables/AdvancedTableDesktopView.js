// AdvancedTable-DesktopView.js
import React from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2"; // برای نمایش جزئیات
import {
  CloudDownload as CloudDownloadIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const AdvancedTableDesktopView = ({
  // کنترل نمایش این بخش‌ها (به صورت پیش‌فرض true)
  showSearchTerm = true,
  showColumnsFilter = true,
  showDownload = true,
  showStatusFilter = true,

  // سایر props
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
  requestSort,
  sortConfig,
  onDragEnd,
  openRow,
  setOpenRow,
  getCardBgColor,
}) => {
  return (
    <>
      {/* فیلترها و کنترل‌های بالا */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        {/* اگر setSearchTerm و showSearchTerm فعال باشند، بخش جستجو را رندر کن */}
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* اگر showDownload=true باشد، دکمه دانلود رندر شود */}
          {showDownload && (
            <Button
              variant="contained"
              startIcon={<CloudDownloadIcon />}
              onClick={handleDownload}
            >
              دانلود اکسل
            </Button>
          )}

          {/* اگر showColumnsFilter=true باشد، بخش فیلتر ستون‌ها نمایش داده شود */}
          {setVisibleColumns && showColumnsFilter && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
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

          {/* اگر setStatusFilter و showStatusFilter فعال باشند، فیلتر وضعیت را رندر کن */}
          {setStatusFilter && showStatusFilter && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
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
        </Box>
      </Box>

      {/* نمایش جدول با قابلیت Drag & Drop و مرتب‌سازی */}
      <TableContainer>
        <DragDropContext onDragEnd={onDragEnd}>
          <Table stickyHeader sx={{ tableLayout: "auto" }}>
            <TableHead>
              <Droppable droppableId="columns" direction="horizontal">
                {(provided) => (
                  <TableRow
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {/* اولین TableCell برای آیکون باز/بستن جزئیات */}
                    <TableCell sx={{ p: { xs: 0.5, sm: 1 } }} />
                    {reorderedColumns
                      .filter((col) => visibleColumns.includes(col.field))
                      .map((col, index) => (
                        <Draggable
                          key={col.field}
                          draggableId={col.field}
                          index={index}
                        >
                          {(provided) => (
                            <TableCell
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                p: { xs: 0.5, sm: 1 },
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                minWidth: "auto",
                              }}
                              onClick={() => requestSort(col.field)}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  cursor: "pointer",
                                }}
                              >
                                <span>{col.label}</span>
                                {sortConfig.key === col.field &&
                                  (sortConfig.direction === "asc" ? (
                                    <ArrowUpwardIcon fontSize="small" />
                                  ) : (
                                    <ArrowDownwardIcon fontSize="small" />
                                  ))}
                              </Box>
                            </TableCell>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                    {/* اگر prop actions وجود داشته باشد، یک ستون عملیات استاتیک اضافه کن */}
                    {actions && (
                      <TableCell
                        sx={{ p: { xs: 0.5, sm: 1 }, minWidth: "auto" }}
                      >
                        عملیات
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </Droppable>
            </TableHead>

            <TableBody>
              {paginatedData.map((row, idx) => (
                <React.Fragment key={idx}>
                  <TableRow
                    style={{ backgroundColor: getCardBgColor(row.Status) }}
                  >
                    {/* آیکون باز/بستن جزئیات */}
                    <TableCell sx={{ p: { xs: 0.5, sm: 1 } }}>
                      <IconButton
                        size="small"
                        onClick={() => setOpenRow(openRow === idx ? null : idx)}
                      >
                        {openRow === idx ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                    </TableCell>

                    {/* سلول‌های عادی */}
                    {reorderedColumns
                      .filter((col) => visibleColumns.includes(col.field))
                      .map((col) => (
                        <TableCell
                          key={col.field}
                          sx={{
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            minWidth: "auto",
                          }}
                        >
                          {row[col.field]}
                        </TableCell>
                      ))}

                    {/* ستون عملیات تنها اگر وضعیت ردیف خاصی باشد (یا بسته به نیاز شما) */}
                    {actions && row.Status === "Processing" && (
                      <TableCell sx={{ p: { xs: 0.5, sm: 1 } }}>
                        {typeof actions === "function"
                          ? actions(row)
                          : "عملیات"}
                      </TableCell>
                    )}
                  </TableRow>

                  {/* ردیف جزئیات در صورت باز بودن */}
                  {openRow === idx && (
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={1 + visibleColumns.length + (actions ? 1 : 0)}
                      >
                        <Collapse in={true} timeout="auto" unmountOnExit>
                          <Box sx={{ m: 1 }}>
                            <Card variant="outlined" sx={{ width: "100%" }}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  جزئیات اطلاعات
                                </Typography>
                                <Grid container spacing={1}>
                                  {Object.entries(row).map(([key, value]) => (
                                    <React.Fragment key={key}>
                                      <Grid xs={12} sm={4}>
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {key}
                                        </Typography>
                                      </Grid>
                                      <Grid xs={12} sm={8}>
                                        <Typography variant="body2">
                                          {value}
                                        </Typography>
                                      </Grid>
                                    </React.Fragment>
                                  ))}
                                </Grid>
                              </CardContent>
                            </Card>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </DragDropContext>
      </TableContainer>
    </>
  );
};

export default AdvancedTableDesktopView;
