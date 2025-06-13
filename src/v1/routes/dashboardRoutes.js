const express = require("express");
const dashboardController = require("../controller/dashboardController"); // Assuming the controller is named dashboardController.js
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/dashboard/:id",
  authenticateToken,
  dashboardController.getDealById
);

router.get(
  "/dashboard",
  authenticateToken,
  dashboardController.getDashboardData
);

// router.get(/dashboard/getAllEmployeeAttendance, authenticateToken, dashboardController.getAllEmployeeAttendance)

module.exports = router;
