const express = require("express");
const AppointmentLatterController = require("../controller/AppointmentLatterController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/appointment-letter",
  authenticateToken,
  AppointmentLatterController.createAppointmentLatter
);
router.get(
  "/appointment-letter/:id",
  authenticateToken,
  AppointmentLatterController.findAppointmentLatterById
);
router.put(
  "/appointment-letter/:id",
  authenticateToken,

  AppointmentLatterController.updateAppointmentLatter
);
router.delete(
  "/appointment-letter/:id",
  authenticateToken,

  AppointmentLatterController.deleteAppointmentLatter
);
router.get(
  "/appointment-letter",
  authenticateToken,
  AppointmentLatterController.getAllAppointmentLatter
);
router.get(
  "/appointment-letter/download/:id",
  authenticateToken,
  AppointmentLatterController.downloadAppointmentLetterPDF
);

router.post(
  "/appointment-letter/bulk-download",
  authenticateToken,
  AppointmentLatterController.bulkDownloadAppointmentLetters
);

router.get(
  "/appointment-letter/bulk-download/status/:jobId",
  authenticateToken,
  AppointmentLatterController.checkBulkDownloadStatus
);

router.get(
  "/appointment-letter/bulk-download/:jobId",
  authenticateToken,
  AppointmentLatterController.downloadBulkAppointmentLetters
);

module.exports = router;
