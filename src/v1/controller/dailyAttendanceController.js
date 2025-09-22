const dailyAttendanceService = require("../services/dailyAttendanceService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

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
    const managerId = req.user.employee_id;
    const { search, page = 1, size = 10 } = req.query;

    const reqData = await dailyAttendanceService.getManagerEmployees(
      managerId,
      search,
      page,
      size
    );

    res.status(200).success("Manager employees retrieved successfully", {
      ...reqData,
      managerId,
      message: `Found ${reqData.data.length} employees under your management`,
    });
  } catch (error) {
    next(error);
  }
};

const getManagerTeamAttendance = async (req, res, next) => {
  try {
    const managerId = req.user.employee_id;
    const {
      search,
      page = 1,
      size = 10,
      startDate,
      endDate,
      employeeId,
    } = req.query;

    const reqData = await dailyAttendanceService.getManagerTeamAttendance(
      managerId,
      search,
      page,
      size,
      startDate,
      endDate,
      employeeId
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

const verifyAttendanceWithAutoHR = async (req, res, next) => {
  try {
    const managerId = req.user.employee_id;
    const {
      attendanceId,
      verificationStatus,
      remarks,
      hrStrategy = "round-robin",
    } = req.body;

    if (!attendanceId || !verificationStatus) {
      throw new CustomError(
        "Attendance ID and verification status are required",
        400
      );
    }

    const reqData = await dailyAttendanceService.verifyAttendanceWithAutoHR(
      managerId,
      attendanceId,
      verificationStatus,
      remarks,
      req.user.log_inst,
      hrStrategy
    );

    res
      .status(200)
      .success("Attendance verified with auto HR notification", reqData);
  } catch (error) {
    next(error);
  }
};

const verifyAttendanceWithManualHR = async (req, res, next) => {
  try {
    const managerId = req.user.id;
    const {
      attendanceId,
      verificationStatus,
      remarks,
      selectedHRUserId,
      notifyHR = true,
    } = req.body;

    if (!attendanceId || !verificationStatus) {
      throw new CustomError(
        "Attendance ID and verification status are required",
        400
      );
    }

    if (notifyHR && !selectedHRUserId) {
      throw new CustomError("Please select an HR user to notify", 400);
    }

    const reqData = await dailyAttendanceService.verifyAttendanceWithManualHR(
      managerId,
      attendanceId,
      verificationStatus,
      remarks,
      req.user.log_inst,
      selectedHRUserId,
      notifyHR
    );

    res
      .status(200)
      .success("Attendance verified with selected HR notification", reqData);
  } catch (error) {
    next(error);
  }
};

const bulkVerifyWithAutoHR = async (req, res, next) => {
  try {
    const managerId = req.user.id;
    const {
      attendanceIds,
      verificationStatus,
      remarks,
      hrStrategy = "round-robin",
    } = req.body;

    if (
      !attendanceIds ||
      !Array.isArray(attendanceIds) ||
      attendanceIds.length === 0
    ) {
      throw new CustomError("Attendance IDs array is required", 400);
    }

    const reqData = await dailyAttendanceService.bulkVerifyWithAutoHR(
      managerId,
      attendanceIds,
      verificationStatus,
      remarks,
      req.user.log_inst,
      hrStrategy
    );

    res
      .status(200)
      .success(
        "Bulk verification completed with auto HR notification",
        reqData
      );
  } catch (error) {
    next(error);
  }
};

const bulkVerifyWithManualHR = async (req, res, next) => {
  try {
    const managerId = req.user.id;
    const {
      attendanceIds,
      verificationStatus,
      remarks,
      selectedHRUserId,
      notifyHR = true,
    } = req.body;

    if (
      !attendanceIds ||
      !Array.isArray(attendanceIds) ||
      attendanceIds.length === 0
    ) {
      throw new CustomError("Attendance IDs array is required", 400);
    }

    if (notifyHR && !selectedHRUserId) {
      throw new CustomError("Please select an HR user to notify", 400);
    }

    const reqData = await dailyAttendanceService.bulkVerifyWithManualHR(
      managerId,
      attendanceIds,
      verificationStatus,
      remarks,
      req.user.log_inst,
      selectedHRUserId,
      notifyHR
    );

    res
      .status(200)
      .success(
        "Bulk verification completed with selected HR notification",
        reqData
      );
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
};
