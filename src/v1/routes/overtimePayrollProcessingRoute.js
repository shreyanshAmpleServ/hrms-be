const express = require("express");
const router = express.Router();
const overtimePayrollProcessingController = require("../controller/overtimePayrollProcessingController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

router.post(
  "/overtime-payroll-processing",
  authenticateToken,
  overtimePayrollProcessingController.createOvertimePayrollProcessing
);

router.get(
  "/overtime-payroll-processing",
  authenticateToken,
  overtimePayrollProcessingController.getAllOvertimePayrollProcessing
);

router.get(
  "/overtime-payroll-processing/:id",
  authenticateToken,
  overtimePayrollProcessingController.findOvertimePayrollProcessing
);

// router.put(
//   "/midmonth-payroll-processing/:id",
//   authenticateToken,
//   overtimePayrollProcessingController.updateOvertimePayrollProcessing
// );

router.delete(
  "/overtime-payroll-processing/:id",
  authenticateToken,
  overtimePayrollProcessingController.deleteOvertimePayrollProcessing
);

module.exports = router;
