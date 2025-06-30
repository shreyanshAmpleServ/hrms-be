const express = require("express");
const router = express.Router();
const midmonthPayrollProcessingController = require("../controller/midmonthPayrollProcessingController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

router.post(
  "/midmonth-payroll-processing",
  authenticateToken,
  midmonthPayrollProcessingController.createMidMonthPayrollProcessing
);

router.get(
  "/midmonth-payroll-processing",
  authenticateToken,
  midmonthPayrollProcessingController.getAllMidMonthPayrollProcessing
);

router.get(
  "/midmonth-payroll-processing/:id",
  authenticateToken,
  midmonthPayrollProcessingController.findMidMonthPayrollProcessing
);

router.put(
  "/midmonth-payroll-processing/:id",
  authenticateToken,
  midmonthPayrollProcessingController.updateMidMonthPayrollProcessing
);

router.delete(
  "/midmonth-payroll-processing/:id",
  authenticateToken,
  midmonthPayrollProcessingController.deleteMidMonthPayrollProcessing
);

module.exports = router;
