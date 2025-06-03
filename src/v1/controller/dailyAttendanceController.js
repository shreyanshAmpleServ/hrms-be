const dailyAttendanceService = require("../services/probationReviewService.js");
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

module.exports = {
  createDailyAttendance,
  findDailyAttendance,
  updateDailyAttendance,
  deleteDailyAttendance,
  getAllDailyAttendance,
};
