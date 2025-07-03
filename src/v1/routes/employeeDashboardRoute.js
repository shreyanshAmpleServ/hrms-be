const express = require("express");
const employeeDashboardController = require("../controller/employeeDashboardController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const { authorizeRole } = require("../middlewares/authorizeRoleMiddleware.js");

const employee = [authenticateToken, authorizeRole(["Employee", "Admin"])];

const router = express.Router();
//coomit
router.get(
  "/employeeDashboard/employee-leaves",
  employee,
  employeeDashboardController.getEmployeeLeavesData
);

router.get(
  "/employeeDashboard",
  employee,
  employeeDashboardController.getEmployeeDashboardData
);

router.get(
  "/employeeDashboard/employee-attendance",
  employee,
  employeeDashboardController.getEmployeeAttendanceSummary
);

router.get(
  "/employeeDashboard/employee-details",
  employee,
  employeeDashboardController.getEmployeeDetails
);

router.get(
  "/employeeDashboard/get-all-upcoming-birthdays",
  employee,
  employeeDashboardController.getAllUpcomingBirthdays
);

module.exports = router;
