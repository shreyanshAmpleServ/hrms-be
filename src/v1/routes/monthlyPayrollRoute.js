const express = require("express");
const router = express.Router();
const monthlyPayrollController = require("../controller/monthlyPayrollController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create monthly payroll routes
router.post(
  "/monthly-payroll",
  authenticateToken,

  monthlyPayrollController.createMonthlyPayroll
);

// Get all monthly payroll routes
router.get(
  "/monthly-payroll",
  authenticateToken,
  monthlyPayrollController.getAllMonthlyPayroll
);

router.get(
  "/monthly-payroll/run-sp",
  monthlyPayrollController.triggerMonthlyPayrollSP
);

router.get(
  "/tax-calculation",
  monthlyPayrollController.triggerMonthlyPayrollCalculationSP
);
router.get("/components", monthlyPayrollController.getComponentNames);

// Get a single monthly payroll by ID routes
router.get(
  "/monthly-payroll/:id",
  authenticateToken,
  monthlyPayrollController.findMonthlyPayroll
);

// Update a monthly payroll by ID routes
router.put(
  "/monthly-payroll/:id",
  authenticateToken,
  monthlyPayrollController.updateMonthlyPayroll
);

// Delete  monthly payroll by ID routes
router.delete(
  "/monthly-payroll/:id",
  authenticateToken,
  monthlyPayrollController.deleteMonthlyPayroll
);

router.post(
  "/generate-monthly-payroll",
  authenticateToken,
  monthlyPayrollController.createOrUpdateMonthlyPayroll
);

router.get(
  "/generated-monthly-payroll",
  authenticateToken,
  monthlyPayrollController.getGeneratedMonthlyPayroll
);

module.exports = router;
