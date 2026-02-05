const express = require("express");
const {
  importExportController,
} = require("../controller/import-export.controller");
const { authenticateToken } = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");
const {
  validateTemplate,
  validateImport,
  validateExport,
} = require("../validations/import-export.validation");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "temp"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadExcel = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = [".csv", ".json", ".xlsx", ".xls"];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV, JSON, and Excel files are allowed"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get(
  "/import-export/tables",
  authenticateToken,
  importExportController.getSupportedTables,
);

router.get(
  "/import-export/:table/template",
  authenticateToken,
  validateTemplate,
  importExportController.downloadTemplate,
);

router.post(
  "/import-export/:table/import",
  authenticateToken,
  uploadExcel.single("file"),
  validateImport,
  importExportController.importData,
);

router.post(
  "/import-export/:table/preview",
  authenticateToken,
  uploadExcel.single("file"),
  validateImport,
  importExportController.previewImport,
);

router.get(
  "/import-export/:table/export/excel",
  authenticateToken,
  validateExport,
  importExportController.exportToExcel,
);

router.get(
  "/import-export/:table/export/csv",
  authenticateToken,
  validateExport,
  importExportController.exportToCSV,
);

router.get(
  "/import-export/:table/export/json",
  authenticateToken,
  validateExport,
  importExportController.exportToJSON,
);

module.exports = router;
