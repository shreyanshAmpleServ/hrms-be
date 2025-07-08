const express = require("express");
const dashboardController = require("../controller/dashboardController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/dashboard/employee-attendance",
  authenticateToken,
  dashboardController.getAllEmployeeAttendance
);

router.get(
  "/dashboard/get-upcoming-birthdays",
  authenticateToken,
  dashboardController.getUpcomingBirthdays
);

router.get(
  "/dashboard/get-all-upcoming-birthdays",
  authenticateToken,
  dashboardController.getAllUpcomingBirthdays
);

router.get(
  "/dashboard/designations",
  authenticateToken,
  dashboardController.getDesignations
);

router.get(
  "/dashboard/departments",
  authenticateToken,
  dashboardController.getDepartment
);

router.get(
  "/dashboard/status",
  authenticateToken,
  dashboardController.getStatus
);

router.get(
  "/dashboard/work-anniversary",
  authenticateToken,
  dashboardController.workAnniversary
);

router.get(
  "/dashboard/attendance-overview",
  authenticateToken,
  dashboardController.attendanceOverview
);

router.get(
  "/dashboard",
  authenticateToken,
  dashboardController.getDashboardData
);

router.get(
  "/dashboard/employee-activity",
  authenticateToken,
  dashboardController.getEmployeeActivity
);

module.exports = router;
