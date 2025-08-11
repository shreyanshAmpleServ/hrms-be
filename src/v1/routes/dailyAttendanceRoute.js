const express = require("express");
const router = express.Router();
const dailyAttendanceController = require("../controller/dailyAttendanceController.js");
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
// router.put(
//   "/daily-attendance/:id",
//   authenticateToken,
//   dailyAttendanceController.updateDailyAttendance
// );

router.post(
  "/daily-attendance/upsert",
  authenticateToken,
  dailyAttendanceController.upsertDailyAttendance
);

// Delete  daily attendance by ID routes
router.delete(
  "/daily-attendance/:id",
  authenticateToken,
  dailyAttendanceController.deleteDailyAttendance
);

router.get(
  "/daily-attendaceSummary",
  authenticateToken,
  dailyAttendanceController.getAttendanceSummaryByEmployee
);

router.get(
  "/findAttendanceByEmployeeId/:id",
  authenticateToken,
  dailyAttendanceController.findAttendanceByEmployeeId
);

module.exports = router;
