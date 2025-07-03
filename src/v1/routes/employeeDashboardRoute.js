const express = require("express");
const employeeDashboardController = require("../controller/employeeDashboardController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const { authorizeRole } = require("../middlewares/authorizeRoleMiddleware.js");
const employeeOnly = [authenticateToken, authorizeRole(["Employee"])];

const router = express.Router();

router.get(
  "/employeeDashboard/employee-leaves",
  employeeOnly,
  employeeDashboardController.getEmployeeLeavesData
);

router.get(
  "/employeeDashboard",
  employeeOnly,
  employeeDashboardController.getEmployeeDashboardData
);

router.get(
  "/employeeDashboard/employee-attendance",
  employeeOnly,
  employeeDashboardController.getEmployeeAttendanceSummary
);

router.get(
  "/employeeDashboard/employee-details",
  employeeOnly,
  employeeDashboardController.getEmployeeDetails
);

router.get(
  "/employeeDashboard/get-all-upcoming-birthdays",
  employeeOnly,
  employeeDashboardController.getAllUpcomingBirthdays
);
module.exports = router;
