const express = require("express");
const appraisalController = require("../controller/appraisalController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/appraisal-entry",
  authenticateToken,
  appraisalController.createAppraisalEntry
);
router.get(
  "/appraisal-entry/:id",
  authenticateToken,
  appraisalController.findAppraisalEntryById
);
router.put(
  "/appraisal-entry/:id",
  authenticateToken,
  appraisalController.updateAppraisalEntry
);
router.delete(
  "/appraisal-entry/:id",
  authenticateToken,
  appraisalController.deleteAppraisalEntry
);
router.get(
  "/appraisal-entry",
  authenticateToken,
  appraisalController.getAllAppraisalEntry
);

router.get(
  "/appraisal-entry/download/:id",
  authenticateToken,
  appraisalController.downloadAppraisalPDF
);
router.post(
  "/appraisal-entry/bulk-download",
  authenticateToken,
  appraisalController.bulkDownloadAppraisals
);
router.get(
  "/appraisal-entry/bulk-download/status/:jobId",
  authenticateToken,
  appraisalController.checkBulkDownloadStatus
);
router.get(
  "/appraisal-entry/bulk-download/:jobId",
  authenticateToken,
  appraisalController.downloadBulkAppraisals
);

module.exports = router;
