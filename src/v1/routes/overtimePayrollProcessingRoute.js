const express = require("express");
const router = express.Router();
const overtimePayrollProcessingController = require("../controller/overtimePayrollProcessingController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

router.post(
  "/overtime-payroll-processing",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Overtime Payroll Processing",
      "create"
    ),
  overtimePayrollProcessingController.createOvertimePayrollProcessing
);

router.get(
  "/overtime-payroll-processing",
  authenticateToken,
  overtimePayrollProcessingController.getAllOvertimePayrollProcessing
);
router.get(
  "/overtime-payroll-processing/run-sp",
  overtimePayrollProcessingController.triggerOvertimePostingSP
);
router.get(
  "/overtime-payroll-processing/:id",
  authenticateToken,
  overtimePayrollProcessingController.findOvertimePayrollProcessing
);

router.put(
  "/overtime-payroll-processing/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Overtime Payroll Processing",
      "update"
    ),
  overtimePayrollProcessingController.updateOvertimePayrollProcessing
);

router.delete(
  "/overtime-payroll-processing/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Overtime Payroll Processing",
      "delete"
    ),
  overtimePayrollProcessingController.deleteOvertimePayrollProcessing
);

module.exports = router;
