// const express = require("express");
// const router = express.Router();
// const dailyAttendanceController = require("../controller/dailyAttendanceController.js");
// const { authenticateToken } = require("../middlewares/authMiddleware.js");
// const {
//   setupNotificationMiddleware,
// } = require("../middlewares/notificationMiddleware");

// // ============= EXISTING ATTENDANCE ROUTES =============
// router.post(
//   "/daily-attendance",
//   authenticateToken,
//   (req, res, next) =>
//     setupNotificationMiddleware(
//       req,
//       res,
//       next,
//       "Daily Attendance Entry",
//       "create"
//     ),
//   dailyAttendanceController.createDailyAttendance
// );

// router.get(
//   "/daily-attendance",
//   authenticateToken,
//   dailyAttendanceController.getAllDailyAttendance
// );
// router.get(
//   "/daily-attendance/:id",
//   authenticateToken,
//   dailyAttendanceController.findDailyAttendance
// );

// // ============= MANAGER ENDPOINTS =============

// // Get employees under manager (using hrms_manager field)
// router.get(
//   "/manager/employees",
//   authenticateToken,
//   dailyAttendanceController.getManagerEmployees
// );

// // Get attendance records for manager's team
// router.get(
//   "/manager/team-attendance",
//   authenticateToken,
//   dailyAttendanceController.getManagerTeamAttendance
// );

// // Get all HR users for manual selection dropdown
// router.get(
//   "/manager/hr-users",
//   authenticateToken,
//   dailyAttendanceController.getAllHRUsers
// );

// // ============= ATTENDANCE VERIFICATION OPTIONS =============

// // Option 1: Basic verification (no HR notification)
// router.post(
//   "/manager/verify-attendance",
//   authenticateToken,
//   (req, res, next) =>
//     setupNotificationMiddleware(
//       req,
//       res,
//       next,
//       "Manager Verification",
//       "create"
//     ),
//   dailyAttendanceController.verifyAttendanceByManager
// );

// // Option 2: Verification with automatic HR selection
// router.post(
//   "/manager/verify-attendance-auto-hr",
//   authenticateToken,
//   (req, res, next) =>
//     setupNotificationMiddleware(
//       req,
//       res,
//       next,
//       "Smart HR Notification",
//       "create"
//     ),
//   dailyAttendanceController.verifyAttendanceWithAutoHR
// );

// // Option 3: Verification with manual HR selection (manager chooses)
// router.post(
//   "/manager/verify-attendance-manual-hr",
//   authenticateToken,
//   (req, res, next) =>
//     setupNotificationMiddleware(
//       req,
//       res,
//       next,
//       "Manual HR Selection",
//       "create"
//     ),
//   dailyAttendanceController.verifyAttendanceWithManualHR
// );

// // ============= BULK VERIFICATION OPTIONS =============

// // Bulk verify with automatic HR selection
// router.post(
//   "/manager/bulk-verify-auto-hr",
//   authenticateToken,
//   (req, res, next) =>
//     setupNotificationMiddleware(req, res, next, "Bulk Auto HR", "create"),
//   dailyAttendanceController.bulkVerifyWithAutoHR
// );

// // Bulk verify with manual HR selection
// router.post(
//   "/manager/bulk-verify-manual-hr",
//   authenticateToken,
//   (req, res, next) =>
//     setupNotificationMiddleware(req, res, next, "Bulk Manual HR", "create"),
//   dailyAttendanceController.bulkVerifyWithManualHR
// );

// // ============= HR DASHBOARD ENDPOINTS =============

// // HR verification status overview
// router.get(
//   "/hr/verification-status",
//   authenticateToken,
//   dailyAttendanceController.getVerificationStatusForHR
// );

// // HR verification summary statistics
// router.get(
//   "/hr/verification-summary",
//   authenticateToken,
//   dailyAttendanceController.getVerificationSummary
// );

// // HR notification management
// router.get(
//   "/hr/my-notifications",
//   authenticateToken,
//   dailyAttendanceController.getHRNotifications
// );

// router.put(
//   "/hr/mark-notification-read/:id",
//   authenticateToken,
//   dailyAttendanceController.markNotificationRead
// );

// module.exports = router;

// const dailyAttendanceService = require("../services/dailyAttendanceService.js");
// const CustomError = require("../../utils/CustomError");
// const moment = require("moment");

// // ============= EXISTING METHODS =============
// const createDailyAttendance = async (req, res, next) => {
//   try {
//     console.log("Incoming request body:", req.body);
//     const data = {
//       ...req.body,
//       createdby: req.user.id,
//       log_inst: req.user.log_inst,
//     };
//     const reqData = await dailyAttendanceService.createDailyAttendance(data);
//     res.status(201).success("Daily attendance created successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// const getAllDailyAttendance = async (req, res, next) => {
//   try {
//     const { search, page, size, startDate, endDate } = req.query;
//     const reqData = await dailyAttendanceService.getAllDailyAttendance(
//       search,
//       page,
//       size,
//       startDate,
//       endDate
//     );
//     res.status(200).success("Daily attendance retrieved successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// const findDailyAttendance = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const reqData = await dailyAttendanceService.findDailyAttendanceById(id);
//     if (!reqData) {
//       throw new CustomError("Daily attendance not found", 404);
//     }
//     res.status(200).success("Daily attendance retrieved successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// // ============= NEW MANAGER METHODS =============

// /**
//  * Get employees under the logged-in manager
//  * Uses hrms_manager field to filter employees
//  */
// const getManagerEmployees = async (req, res, next) => {
//   try {
//     const managerId = req.user.id;
//     const { search, page = 1, size = 10 } = req.query;

//     const reqData = await dailyAttendanceService.getManagerEmployees(
//       managerId,
//       search,
//       page,
//       size
//     );

//     res.status(200).success("Manager employees retrieved successfully", {
//       ...reqData,
//       managerId,
//       message: `Found ${reqData.data.length} employees under your management`,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * Get attendance records for manager's team
//  */
// const getManagerTeamAttendance = async (req, res, next) => {
//   try {
//     const managerId = req.user.id;
//     const {
//       search,
//       page = 1,
//       size = 10,
//       startDate,
//       endDate,
//       employeeId,
//     } = req.query;

//     const reqData = await dailyAttendanceService.getManagerTeamAttendance(
//       managerId,
//       search,
//       page,
//       size,
//       startDate,
//       endDate,
//       employeeId
//     );

//     res.status(200).success("Team attendance retrieved successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * Get all HR users for manager to choose from
//  */
// const getAllHRUsers = async (req, res, next) => {
//   try {
//     const reqData = await dailyAttendanceService.getAllHRUsers();

//     res.status(200).success("HR users retrieved successfully", {
//       hrUsers: reqData,
//       totalCount: reqData.length,
//       message: "Select an HR user to notify about your verification",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============= ATTENDANCE VERIFICATION METHODS =============

// /**
//  * Basic verification without HR notification
//  */
// const verifyAttendanceByManager = async (req, res, next) => {
//   try {
//     const managerId = req.user.id;
//     const { attendanceId, verificationStatus, remarks } = req.body;

//     if (!attendanceId || !verificationStatus) {
//       throw new CustomError(
//         "Attendance ID and verification status are required",
//         400
//       );
//     }

//     if (!["APPROVED", "REJECTED", "PENDING"].includes(verificationStatus)) {
//       throw new CustomError(
//         "Invalid verification status. Must be APPROVED, REJECTED, or PENDING",
//         400
//       );
//     }

//     const reqData = await dailyAttendanceService.verifyAttendanceByManager(
//       managerId,
//       attendanceId,
//       verificationStatus,
//       remarks,
//       req.user.log_inst
//     );

//     res.status(200).success("Attendance verified successfully", {
//       ...reqData,
//       message: `Attendance ${verificationStatus.toLowerCase()} successfully (no HR notification sent)`,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * Verification with automatic HR selection
//  */
// const verifyAttendanceWithAutoHR = async (req, res, next) => {
//   try {
//     const managerId = req.user.id;
//     const {
//       attendanceId,
//       verificationStatus,
//       remarks,
//       hrStrategy = "round-robin",
//     } = req.body;

//     if (!attendanceId || !verificationStatus) {
//       throw new CustomError(
//         "Attendance ID and verification status are required",
//         400
//       );
//     }

//     const reqData = await dailyAttendanceService.verifyAttendanceWithAutoHR(
//       managerId,
//       attendanceId,
//       verificationStatus,
//       remarks,
//       req.user.log_inst,
//       hrStrategy
//     );

//     res
//       .status(200)
//       .success("Attendance verified with auto HR notification", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * Verification with manual HR selection
//  */
// const verifyAttendanceWithManualHR = async (req, res, next) => {
//   try {
//     const managerId = req.user.id;
//     const {
//       attendanceId,
//       verificationStatus,
//       remarks,
//       selectedHRUserId,
//       notifyHR = true,
//     } = req.body;

//     if (!attendanceId || !verificationStatus) {
//       throw new CustomError(
//         "Attendance ID and verification status are required",
//         400
//       );
//     }

//     if (notifyHR && !selectedHRUserId) {
//       throw new CustomError("Please select an HR user to notify", 400);
//     }

//     const reqData = await dailyAttendanceService.verifyAttendanceWithManualHR(
//       managerId,
//       attendanceId,
//       verificationStatus,
//       remarks,
//       req.user.log_inst,
//       selectedHRUserId,
//       notifyHR
//     );

//     res
//       .status(200)
//       .success("Attendance verified with selected HR notification", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// // ============= BULK VERIFICATION METHODS =============

// /**
//  * Bulk verify with automatic HR selection
//  */
// const bulkVerifyWithAutoHR = async (req, res, next) => {
//   try {
//     const managerId = req.user.id;
//     const {
//       attendanceIds,
//       verificationStatus,
//       remarks,
//       hrStrategy = "round-robin",
//     } = req.body;

//     if (
//       !attendanceIds ||
//       !Array.isArray(attendanceIds) ||
//       attendanceIds.length === 0
//     ) {
//       throw new CustomError("Attendance IDs array is required", 400);
//     }

//     const reqData = await dailyAttendanceService.bulkVerifyWithAutoHR(
//       managerId,
//       attendanceIds,
//       verificationStatus,
//       remarks,
//       req.user.log_inst,
//       hrStrategy
//     );

//     res
//       .status(200)
//       .success(
//         "Bulk verification completed with auto HR notification",
//         reqData
//       );
//   } catch (error) {
//     next(error);
//   }
// };

// const bulkVerifyWithManualHR = async (req, res, next) => {
//   try {
//     const managerId = req.user.id;
//     const {
//       attendanceIds,
//       verificationStatus,
//       remarks,
//       selectedHRUserId,
//       notifyHR = true,
//     } = req.body;

//     if (
//       !attendanceIds ||
//       !Array.isArray(attendanceIds) ||
//       attendanceIds.length === 0
//     ) {
//       throw new CustomError("Attendance IDs array is required", 400);
//     }

//     if (notifyHR && !selectedHRUserId) {
//       throw new CustomError("Please select an HR user to notify", 400);
//     }

//     const reqData = await dailyAttendanceService.bulkVerifyWithManualHR(
//       managerId,
//       attendanceIds,
//       verificationStatus,
//       remarks,
//       req.user.log_inst,
//       selectedHRUserId,
//       notifyHR
//     );

//     res
//       .status(200)
//       .success(
//         "Bulk verification completed with selected HR notification",
//         reqData
//       );
//   } catch (error) {
//     next(error);
//   }
// };

// // ============= HR DASHBOARD METHODS =============

// /**
//  * Get verification status for HR dashboard
//  */
// const getVerificationStatusForHR = async (req, res, next) => {
//   try {
//     const {
//       search,
//       page = 1,
//       size = 20,
//       startDate,
//       endDate,
//       verificationStatus,
//       managerId,
//     } = req.query;

//     const reqData = await dailyAttendanceService.getVerificationStatusForHR(
//       search,
//       page,
//       size,
//       startDate,
//       endDate,
//       verificationStatus,
//       managerId
//     );

//     res
//       .status(200)
//       .success("Verification status retrieved successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * Get verification summary statistics
//  */
// const getVerificationSummary = async (req, res, next) => {
//   try {
//     const { startDate, endDate, managerId } = req.query;

//     const reqData = await dailyAttendanceService.getVerificationSummary(
//       startDate,
//       endDate,
//       managerId
//     );

//     res
//       .status(200)
//       .success("Verification summary retrieved successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * Get HR notifications for logged-in HR user
//  */
// const getHRNotifications = async (req, res, next) => {
//   try {
//     const hrUserId = req.user.id;
//     const { page = 1, size = 10, isRead } = req.query;

//     const reqData = await dailyAttendanceService.getHRNotifications(
//       hrUserId,
//       page,
//       size,
//       isRead
//     );

//     res.status(200).success("HR notifications retrieved successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * Mark notification as read
//  */
// const markNotificationRead = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const hrUserId = req.user.id;

//     const reqData = await dailyAttendanceService.markNotificationRead(
//       id,
//       hrUserId
//     );

//     res.status(200).success("Notification marked as read", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   // Existing exports
//   createDailyAttendance,
//   getAllDailyAttendance,
//   findDailyAttendance,

//   // Manager exports
//   getManagerEmployees,
//   getManagerTeamAttendance,
//   getAllHRUsers,

//   // Verification exports
//   verifyAttendanceByManager,
//   verifyAttendanceWithAutoHR,
//   verifyAttendanceWithManualHR,

//   // Bulk verification exports
//   bulkVerifyWithAutoHR,
//   bulkVerifyWithManualHR,

//   // HR exports
//   getVerificationStatusForHR,
//   getVerificationSummary,
//   getHRNotifications,
//   markNotificationRead,
// };

// const dailyAttendanceModel = require("../models/dailyAttendanceModel.js");

// // ============= EXISTING SERVICE METHODS =============
// const createDailyAttendance = async (data) => {
//   return await dailyAttendanceModel.createDailyAttendance(data);
// };

// const findDailyAttendanceById = async (id) => {
//   return await dailyAttendanceModel.findDailyAttendanceById(id);
// };

// const updateDailyAttendance = async (id, data) => {
//   return await dailyAttendanceModel.updateDailyAttendance(id, data);
// };

// const deleteDailyAttendance = async (id) => {
//   return await dailyAttendanceModel.deleteDailyAttendance(id);
// };

// const getAllDailyAttendance = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate
// ) => {
//   return await dailyAttendanceModel.getAllDailyAttendance(
//     search,
//     page,
//     size,
//     startDate,
//     endDate
//   );
// };

// const getAttendanceSummaryByEmployee = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate
// ) => {
//   return await dailyAttendanceModel.getAttendanceSummaryByEmployee(
//     search,
//     page,
//     size,
//     startDate,
//     endDate
//   );
// };

// const upsertDailyAttendance = async (id, data) => {
//   return await dailyAttendanceModel.upsertDailyAttendance(id, data);
// };

// // ============= NEW MANAGER SERVICE METHODS =============

// /**
//  * Get employees under manager using hrms_manager field
//  */
// const getManagerEmployees = async (managerId, search, page, size) => {
//   return await dailyAttendanceModel.getManagerEmployees(
//     managerId,
//     search,
//     page,
//     size
//   );
// };

// /**
//  * Get attendance records for manager's team
//  */
// const getManagerTeamAttendance = async (
//   managerId,
//   search,
//   page,
//   size,
//   startDate,
//   endDate,
//   employeeId
// ) => {
//   return await dailyAttendanceModel.getManagerTeamAttendance(
//     managerId,
//     search,
//     page,
//     size,
//     startDate,
//     endDate,
//     employeeId
//   );
// };

// /**
//  * Get all HR users for selection dropdown
//  */
// const getAllHRUsers = async () => {
//   return await dailyAttendanceModel.getAllHRUsers();
// };

// // ============= VERIFICATION SERVICE METHODS =============

// /**
//  * Basic verification without HR notification
//  */
// const verifyAttendanceByManager = async (
//   managerId,
//   attendanceId,
//   verificationStatus,
//   remarks,
//   logInst
// ) => {
//   return await dailyAttendanceModel.verifyAttendanceByManager(
//     managerId,
//     attendanceId,
//     verificationStatus,
//     remarks,
//     logInst
//   );
// };

// /**
//  * Verification with automatic HR selection
//  */
// const verifyAttendanceWithAutoHR = async (
//   managerId,
//   attendanceId,
//   verificationStatus,
//   remarks,
//   logInst,
//   strategy
// ) => {
//   return await dailyAttendanceModel.verifyAttendanceWithAutoHR(
//     managerId,
//     attendanceId,
//     verificationStatus,
//     remarks,
//     logInst,
//     strategy
//   );
// };

// /**
//  * Verification with manual HR selection
//  */
// const verifyAttendanceWithManualHR = async (
//   managerId,
//   attendanceId,
//   verificationStatus,
//   remarks,
//   logInst,
//   selectedHRUserId,
//   notifyHR
// ) => {
//   return await dailyAttendanceModel.verifyAttendanceWithManualHR(
//     managerId,
//     attendanceId,
//     verificationStatus,
//     remarks,
//     logInst,
//     selectedHRUserId,
//     notifyHR
//   );
// };

// // ============= BULK VERIFICATION SERVICE METHODS =============

// /**
//  * Bulk verify with automatic HR selection
//  */
// const bulkVerifyWithAutoHR = async (
//   managerId,
//   attendanceIds,
//   verificationStatus,
//   remarks,
//   logInst,
//   strategy
// ) => {
//   return await dailyAttendanceModel.bulkVerifyWithAutoHR(
//     managerId,
//     attendanceIds,
//     verificationStatus,
//     remarks,
//     logInst,
//     strategy
//   );
// };

// /**
//  * Bulk verify with manual HR selection
//  */
// const bulkVerifyWithManualHR = async (
//   managerId,
//   attendanceIds,
//   verificationStatus,
//   remarks,
//   logInst,
//   selectedHRUserId,
//   notifyHR
// ) => {
//   return await dailyAttendanceModel.bulkVerifyWithManualHR(
//     managerId,
//     attendanceIds,
//     verificationStatus,
//     remarks,
//     logInst,
//     selectedHRUserId,
//     notifyHR
//   );
// };

// // ============= HR SERVICE METHODS =============

// /**
//  * Get verification status for HR dashboard
//  */
// const getVerificationStatusForHR = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate,
//   verificationStatus,
//   managerId
// ) => {
//   return await dailyAttendanceModel.getVerificationStatusForHR(
//     search,
//     page,
//     size,
//     startDate,
//     endDate,
//     verificationStatus,
//     managerId
//   );
// };

// /**
//  * Get verification summary statistics
//  */
// const getVerificationSummary = async (startDate, endDate, managerId) => {
//   return await dailyAttendanceModel.getVerificationSummary(
//     startDate,
//     endDate,
//     managerId
//   );
// };

// /**
//  * Get HR notifications
//  */
// const getHRNotifications = async (hrUserId, page, size, isRead) => {
//   return await dailyAttendanceModel.getHRNotifications(
//     hrUserId,
//     page,
//     size,
//     isRead
//   );
// };

// /**
//  * Mark notification as read
//  */
// const markNotificationRead = async (notificationId, hrUserId) => {
//   return await dailyAttendanceModel.markNotificationRead(
//     notificationId,
//     hrUserId
//   );
// };

// module.exports = {
//   // Existing exports
//   createDailyAttendance,
//   findDailyAttendanceById,
//   updateDailyAttendance,
//   deleteDailyAttendance,
//   getAllDailyAttendance,
//   getAttendanceSummaryByEmployee,
//   upsertDailyAttendance,

//   // Manager services
//   getManagerEmployees,
//   getManagerTeamAttendance,
//   getAllHRUsers,

//   // Verification services
//   verifyAttendanceByManager,
//   verifyAttendanceWithAutoHR,
//   verifyAttendanceWithManualHR,

//   // Bulk verification services
//   bulkVerifyWithAutoHR,
//   bulkVerifyWithManualHR,

//   // HR services
//   getVerificationStatusForHR,
//   getVerificationSummary,
//   getHRNotifications,
//   markNotificationRead,
// };
