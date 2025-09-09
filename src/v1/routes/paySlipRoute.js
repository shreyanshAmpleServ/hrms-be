const express = require("express");
const paySlipController = require("../controller/paySlipController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/UploadFileMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/payslip",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Payslip Viewer", "create"),
  upload.single("pdf_path"),
  paySlipController.createPaySlip
);
router.get(
  "/payslip/:id",
  authenticateToken,
  paySlipController.findPaySlipById
);
router.put(
  "/payslip/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Payslip Viewer", "update"),
  upload.single("pdf_path"),
  paySlipController.updatePaySlip
);
router.delete(
  "/payslip/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Payslip Viewer", "delete"),
  paySlipController.deletePaySlip
);
router.get("/payslip", authenticateToken, paySlipController.getAllPaySlip);

module.exports = router;
