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
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
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
