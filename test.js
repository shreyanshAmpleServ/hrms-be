// // Preview uploaded Excel (no DB save)
// router.post(
//   "/basic-pay/import/preview",
//   authenticateToken,
//   upload.single("file"),
//   BasicPayController.previewExcel
// );

// // Download preview as Excel
// router.post(
//   "/basic-pay/import/preview/download",
//   authenticateToken,
//   upload.single("file"),
//   BasicPayController.downloadPreviewExcel
// );

// // Controller
// const BasicPayService = require("../services/BasicPayService");
// const CustomError = require("../../utils/CustomError");

// // ✅ Preview Excel file
// const previewExcel = async (req, res, next) => {
//   try {
//     if (!req.file) throw new CustomError("No file uploaded", 400);

//     const previewData = await BasicPayService.previewExcel(req.file.buffer);

//     res.status(200).success("Excel preview generated", previewData);
//   } catch (error) {
//     next(error);
//   }
// };

// // ✅ Download preview Excel
// const downloadPreviewExcel = async (req, res, next) => {
//   try {
//     if (!req.file) throw new CustomError("No file uploaded", 400);

//     const buffer = await BasicPayService.downloadPreviewExcel(req.file.buffer);

//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="preview_${Date.now()}.xlsx"`
//     );
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );

//     res.send(buffer);
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   ...existingExports,
//   previewExcel,
//   downloadPreviewExcel,
// };

// // service
// const BasicPayModel = require("../models/BasicPayModel");

// // Service: only orchestrates Model calls
// const previewExcel = async (fileBuffer) => {
//   return await BasicPayModel.previewExcel(fileBuffer);
// };

// const downloadPreviewExcel = async (fileBuffer) => {
//   return await BasicPayModel.downloadPreviewExcel(fileBuffer);
// };

// module.exports = {
//   ...existingExports,
//   previewExcel,
//   downloadPreviewExcel,
// };

// // model
// const XLSX = require("xlsx");

// // ✅ Convert uploaded Excel buffer to JSON
// const previewExcel = async (fileBuffer) => {
//   const workbook = XLSX.read(fileBuffer, { type: "buffer" });
//   const sheetName = workbook.SheetNames[0];
//   const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//   // Optionally add row numbers
//   return sheetData.map((row, index) => ({
//     row: index + 1,
//     ...row,
//   }));
// };

// // ✅ Convert uploaded Excel buffer back into downloadable Excel
// const downloadPreviewExcel = async (fileBuffer) => {
//   const workbook = XLSX.read(fileBuffer, { type: "buffer" });
//   const sheetName = workbook.SheetNames[0];
//   const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//   const ws = XLSX.utils.json_to_sheet(sheetData);
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, "Preview");

//   return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
// };

// module.exports = {
//   ...existingExports,
//   previewExcel,
//   downloadPreviewExcel,
// };
