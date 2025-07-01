const express = require("express");
const employeeDashboardController = require("../controller/employeeDashboardController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.get(
  "/employeeDashboard/employee-leaves",
  authenticateToken,
  employeeDashboardController.getEmployeeLeavesData
);

router.get(
  "/employeeDashboard",
  authenticateToken,
  employeeDashboardController.getEmployeeDashboardData
);

router.get(
  "/employeeDashboard/employee-attendance",
  authenticateToken,
  employeeDashboardController.getEmployeeAttendanceSummary
);
module.exports = router;
