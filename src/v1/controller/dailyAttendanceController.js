const dailyAttendanceService = require("../services/dailyAttendanceService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { prisma } = require("../../utils/prismaProxy");

const attendanceScheduler = require("../services/attendanceScheduler");

const createDefaultAttendanceForToday = async (req, res, next) => {
  try {
    const { date } = req.query;
    const result = await attendanceScheduler.createDefaultAttendanceForDate(
      date
    );

    if (result.success) {
      res.status(200).success(result.message, {
        recordsCreated: result.recordsCreated,
        totalEmployees: result.totalEmployees,
        date: result.date,
      });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    next(error);
  }
};
const createDailyAttendance = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await dailyAttendanceService.createDailyAttendance(data);
    res.status(201).success("Daily attendance created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const upsertDailyAttendance = async (req, res, next) => {
  try {
    const { id } = req.body;

    const data = {
      ...req.body,
      updatedby: req.user.id,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };

    const reqData = await dailyAttendanceService.upsertDailyAttendance(
      id && id !== "0" ? id : null,
      data
    );

    res
      .status(200)
      .success(
        id && id !== "0"
          ? "Daily attendance updated successfully"
          : "Daily attendance created successfully",
        reqData
      );
  } catch (error) {
    next(error);
  }
};

const findDailyAttendance = async (req, res, next) => {
  try {
    const reqData = await dailyAttendanceService.findDailyAttendanceById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Daily attendance not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateDailyAttendance = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await dailyAttendanceService.updateDailyAttendance(
      req.params.id,
      data
    );
    res.status(200).success("Daily attendance updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteDailyAttendance = async (req, res, next) => {
  try {
    await dailyAttendanceService.deleteDailyAttendance(req.params.id);
    res.status(200).success("Daily attendance deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllDailyAttendance = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await dailyAttendanceService.getAllDailyAttendance(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate)
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const getAttendanceSummaryByEmployee = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;

    const start = startDate ? moment(startDate, "YYYY-MM-DD", true) : null;
    const end = endDate ? moment(endDate, "YYYY-MM-DD", true) : null;

    if ((startDate && !start.isValid()) || (endDate && !end.isValid())) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    const data = await dailyAttendanceService.getAttendanceSummaryByEmployee(
      search,
      Number(page),
      Number(size),
      start,
      end
    );

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const findAttendanceByEmployeeId = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const employeeId = req.params.id;

    const result = await dailyAttendanceService.findAttendanceByEmployeeId(
      employeeId,
      startDate,
      endDate
    );

    res
      .status(200)
      .success("Attendance of employee retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

const getManagerEmployees = async (req, res, next) => {
  try {
    const manager_id = req.user.employee_id;
    const { search, page = 1, size = 10 } = req.query;

    const reqData = await dailyAttendanceService.getManagerEmployees(
      manager_id,
      search,
      page,
      size
    );

    res.status(200).success("Manager employees retrieved successfully", {
      ...reqData,
      manager_id,
      message: `Found ${reqData.data.length} employees under your management`,
    });
  } catch (error) {
    next(error);
  }
};

const getManagerTeamAttendance = async (req, res, next) => {
  try {
    const manager_id = req.user.employee_id;
    const {
      search,
      page = 1,
      size = 10,
      startDate,
      endDate,
      employee_id,
    } = req.query;

    const reqData = await dailyAttendanceService.getManagerTeamAttendance(
      manager_id,
      search,
      page,
      size,
      startDate,
      endDate,
      employee_id
    );

    res.status(200).success("Team attendance retrieved successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const getAllHRUsers = async (req, res, next) => {
  try {
    const reqData = await dailyAttendanceService.getAllHRUsers();

    res.status(200).success("HR users retrieved successfully", {
      hrUsers: reqData,
      totalCount: reqData.length,
      message: "Select an HR user to notify about your verification",
    });
  } catch (error) {
    next(error);
  }
};

const verifyAttendanceByManager = async (req, res, next) => {
  try {
    const manager_id = req.user.id;
    const { attendanceId, verificationStatus, remarks } = req.body;

    if (!attendanceId || !verificationStatus) {
      throw new CustomError(
        "Attendance ID and verification status are required",
        400
      );
    }

    if (!["A", "R", "P"].includes(verificationStatus)) {
      throw new CustomError(
        "Invalid verification status. Must be A, R, or P",
        400
      );
    }

    const reqData = await dailyAttendanceService.verifyAttendanceByManager(
      manager_id,
      attendanceId,
      verificationStatus,
      remarks,
      req.user.log_inst
    );

    res.status(200).success("Attendance verified successfully", {
      ...reqData,
      message: `Attendance ${verificationStatus.toLowerCase()} successfully (no HR notification sent)`,
    });
  } catch (error) {
    next(error);
  }
};

const verifyAttendanceWithManualHR = async (req, res, next) => {
  try {
    const manager_id = req.user.id;
    const {
      attendance_id,
      verification_status,
      remarks,
      selected_hr_userId,
      notify_HR = true,
    } = req.body;

    if (!attendance_id || !verification_status) {
      throw new CustomError(
        "Attendance ID and verification status are required",
        400
      );
    }

    if (notify_HR && !selected_hr_userId) {
      throw new CustomError("Please select an HR user to notify", 400);
    }

    const reqData = await dailyAttendanceService.verifyAttendanceWithManualHR(
      manager_id,
      attendance_id,
      verification_status,
      remarks,
      req.user.log_inst,
      selected_hr_userId,
      notify_HR
    );

    res
      .status(200)
      .success("Attendance verified with selected HR notification", reqData);
  } catch (error) {
    next(error);
  }
};

const bulkVerifyWithManualHR = async (req, res, next) => {
  try {
    const manager_id = req.user.employee_id;

    const reqData = await dailyAttendanceService.bulkVerifyWithManualHR(
      manager_id,
      "A",
      "Bulk verification by manager - all team attendance approved",
      req.user.log_inst,
      true
    );

    res
      .status(200)
      .success("Bulk team verification completed successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const getVerificationStatusForHR = async (req, res, next) => {
  try {
    const {
      search,
      page = 1,
      size = 20,
      startDate,
      endDate,
      verificationStatus,
      manager_id,
    } = req.query;

    const reqData = await dailyAttendanceService.getVerificationStatusForHR(
      search,
      page,
      size,
      startDate,
      endDate,
      verificationStatus,
      manager_id
    );

    res
      .status(200)
      .success("Verification status retrieved successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const getVerificationSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, manager_id } = req.query;

    const reqData = await dailyAttendanceService.getVerificationSummary(
      startDate,
      endDate,
      manager_id
    );

    res
      .status(200)
      .success("Verification summary retrieved successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const getHRNotifications = async (req, res, next) => {
  try {
    const hrUserId = req.user.id;
    const { page = 1, size = 10, isRead } = req.query;

    const reqData = await dailyAttendanceService.getHRNotifications(
      hrUserId,
      page,
      size,
      isRead
    );

    res.status(200).success("HR notifications retrieved successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hrUserId = req.user.id;

    const reqData = await dailyAttendanceService.markNotificationRead(
      id,
      hrUserId
    );

    res.status(200).success("Notification marked as read", reqData);
  } catch (error) {
    next(error);
  }
};

const getAllManagersWithVerifications = async (req, res, next) => {
  try {
    const reqData =
      await dailyAttendanceService.getAllManagersWithVerifications();

    res.status(200).success("Managers retrieved successfully", {
      managers: reqData,
      totalCount: reqData.length,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createDailyAttendance,
  findDailyAttendance,
  updateDailyAttendance,
  deleteDailyAttendance,
  getAllDailyAttendance,
  getAttendanceSummaryByEmployee,
  findAttendanceByEmployeeId,
  upsertDailyAttendance,
  getManagerEmployees,
  getManagerTeamAttendance,
  getAllHRUsers,

  verifyAttendanceByManager,
  verifyAttendanceWithManualHR,

  bulkVerifyWithManualHR,

  getVerificationStatusForHR,
  getVerificationSummary,
  getHRNotifications,
  markNotificationRead,

  getAllManagersWithVerifications,
  createDefaultAttendanceForToday,
};
