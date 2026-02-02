const express = require("express");
const router = express.Router();
const dailyAttendanceController = require("../controller/dailyAttendanceController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/UploadFileMiddleware.js");

// Create daily attendance routes
router.post(
  "/daily-attendance",
  authenticateToken,
  dailyAttendanceController.createDailyAttendance,
);

// Get all daily attendance routes
router.get(
  "/daily-attendance",
  authenticateToken,
  dailyAttendanceController.getAllDailyAttendance,
);

// Get a single daily attendance by ID routes
router.get(
  "/daily-attendance/:id",
  authenticateToken,
  dailyAttendanceController.findDailyAttendance,
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
  dailyAttendanceController.upsertDailyAttendance,
);

// Delete  daily attendance by ID routes
router.delete(
  "/daily-attendance/:id",
  authenticateToken,
  dailyAttendanceController.deleteDailyAttendance,
);

router.get(
  "/daily-attendaceSummary",
  authenticateToken,
  dailyAttendanceController.getAttendanceSummaryByEmployee,
);
router.get(
  "/findAttendanceByEmployeeId/:id",
  authenticateToken,
  dailyAttendanceController.findAttendanceByEmployeeId,
);

router.get(
  "/manager/employees",
  authenticateToken,
  upload.single("file"),
  dailyAttendanceController.getManagerEmployees,
);

router.get(
  "/manager/team-attendance",
  authenticateToken,
  dailyAttendanceController.getManagerTeamAttendance,
);

router.get(
  "/manager/hr-users",
  authenticateToken,
  dailyAttendanceController.getAllHRUsers,
);

router.post(
  "/manager/verify-attendance-manual-hr",
  authenticateToken,
  dailyAttendanceController.verifyAttendanceWithManualHR,
);

router.get(
  "/hr/my-notifications",
  authenticateToken,
  dailyAttendanceController.getHRNotifications,
);

router.post(
  "/manager/bulk-attendance",
  authenticateToken,
  dailyAttendanceController.bulkVerifyWithManualHR,
);

router.get(
  "/hr/verified-attendance",
  authenticateToken,
  dailyAttendanceController.getVerificationStatusForHR,
);

router.get(
  "/hr/verification-summary",
  authenticateToken,
  dailyAttendanceController.getVerificationSummary,
);

router.get(
  "/hr/managers",
  authenticateToken,
  dailyAttendanceController.getAllManagersWithVerifications,
);

router.post(
  "/create-default-attendance",
  authenticateToken,
  dailyAttendanceController.createDefaultAttendanceForToday,
);
router.post(
  "/daily-attendance-bulk-upload",
  authenticateToken,
  dailyAttendanceController.importAttendanceFromExcel,
);
router.get(
  "/daily-attendance-sample-excel",
  authenticateToken,
  dailyAttendanceController.generateAttendanceSampleExcel,
);

module.exports = router;
