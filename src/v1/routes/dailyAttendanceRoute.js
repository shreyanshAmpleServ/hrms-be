const express = require("express");
const router = express.Router();
const dailyAttendanceController = require("../controller/probationReviewController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create daily attendance routes
router.post(
  "/daily-attendance",
  authenticateToken,
  dailyAttendanceController.createDailyAttendance
);

// Get all daily attendance routes
router.get(
  "/daily-attendance",
  authenticateToken,
  dailyAttendanceController.getAllDailyAttendance
);

// Get a single daily attendance by ID routes
router.get(
  "/daily-attendance/:id",
  authenticateToken,
  dailyAttendanceController.findDailyAttendance
);

// Update a daily attendance by ID routes
router.put(
  "/daily-attendance/:id",
  authenticateToken,
  dailyAttendanceController.updateDailyAttendance
);

// Delete  daily attendance by ID routes
router.delete(
  "/daily-attendance/:id",
  authenticateToken,
  dailyAttendanceController.deleteDailyAttendance
);

module.exports = router;
