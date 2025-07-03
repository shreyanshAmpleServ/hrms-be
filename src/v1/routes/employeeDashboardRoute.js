const express = require("express");
const employeeDashboardController = require("../controller/employeeDashboardController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const { authorizeRole } = require("../middlewares/authorizeRoleMiddleware.js");
const employeeOnly = [authenticateToken, authorizeRole(["Employee"])];

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

router.get(
  "/employeeDashboard/employee-details",
  authenticateToken,
  employeeDashboardController.getEmployeeDetails
);

router.get(
  "/employeeDashboard/get-all-upcoming-birthdays",
  authenticateToken,
  employeeDashboardController.getAllUpcomingBirthdays
);
module.exports = router;
