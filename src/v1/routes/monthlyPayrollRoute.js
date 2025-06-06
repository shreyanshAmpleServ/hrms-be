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

module.exports = router;
