const express = require("express");
const router = express.Router();
const importExportController = require("../controller/importExportController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

router.get(
  "/import-export/tables",
  authenticateToken,
  importExportController.getAvailableTables
);
router.get(
  "/import-export/template/:tableName",
  authenticateToken,
  importExportController.downloadTemplate
);
router.post(
  "/import-export/preview",
  authenticateToken,
  importExportController.upload.single("file"),
  importExportController.previewExcelData
);
router.post(
  "/import-export/import",
  authenticateToken,
  importExportController.upload.single("file"),
  importExportController.importData
);
router.get(
  "/import-export/export/:tableName",
  authenticateToken,
  importExportController.exportToExcel
);

module.exports = router;
