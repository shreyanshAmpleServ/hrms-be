const express = require("express");
const router = express.Router();
const midmonthPayrollProcessingController = require("../controller/midmonthPayrollProcessingController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");
router.post(
  "/midmonth-payroll-processing",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Midmonth Payroll Processing",
      "create"
    ),
  midmonthPayrollProcessingController.createMidMonthPayrollProcessing
);

router.get(
  "/midmonth-payroll-processing",
  authenticateToken,
  midmonthPayrollProcessingController.getAllMidMonthPayrollProcessing
);
router.get(
  "/midmonth-payroll-processing/run-sp",
  authenticateToken,
  midmonthPayrollProcessingController.triggerMidMonthPostingSP
);

router.get(
  "/midmonth-payroll-processing/:id",
  authenticateToken,
  midmonthPayrollProcessingController.findMidMonthPayrollProcessing
);

router.put(
  "/midmonth-payroll-processing/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Midmonth Payroll Processing",
      "update"
    ),
  midmonthPayrollProcessingController.updateMidMonthPayrollProcessing
);

router.delete(
  "/midmonth-payroll-processing/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Midmonth Payroll Processing",
      "delete"
    ),
  midmonthPayrollProcessingController.deleteMidMonthPayrollProcessing
);

module.exports = router;
