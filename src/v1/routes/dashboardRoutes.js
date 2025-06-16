const express = require("express");
const dashboardController = require("../controller/dashboardController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/dashboard/getAllEmployeeAttendance",
  authenticateToken,
  dashboardController.getAllEmployeeAttendance
);

router.get(
  "/dashboard/getUpcomingBirthdays",
  authenticateToken,
  dashboardController.getUpcomingBirthdays
);

router.get(
  "/dashboard/getAllUpcomingBirthdays",
  authenticateToken,
  dashboardController.getAllUpcomingBirthdays
);

router.get(
  "/dashboard/getDesignations",
  authenticateToken,
  dashboardController.getDesignations
);

router.get(
  "/dashboard/getDepartment",
  authenticateToken,
  dashboardController.getDepartment
);
router.get(
  "/dashboard/getAbsents",
  authenticateToken,
  dashboardController.getAllAbsents
);

router.get(
  "/dashboard/getStatus",
  authenticateToken,
  dashboardController.getStatus
);

router.get(
  "/dashboard",
  authenticateToken,
  dashboardController.getDashboardData
);

// router.get(
//   "/dashboard/:id",
//   authenticateToken,
//   dashboardController.getDealById
// );

module.exports = router;
