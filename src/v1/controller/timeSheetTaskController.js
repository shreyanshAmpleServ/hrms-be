const timeSheetTaskService = require("../services/timeSheetTaskService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createTimeSheetTask = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await timeSheetTaskService.createTimesheetTask(data);
    res.status(201).success("Time sheet created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findTimesheetTask = async (req, res, next) => {
  try {
    const reqData = await timeSheetTaskService.findTimesheetTaskById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Time sheet not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateTimesheetTask = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await timeSheetTaskService.updateTimesheetTask(
      req.params.id,
      data
    );
    res.status(200).success("Time sheet updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteTimesheetTask = async (req, res, next) => {
  try {
    await timeSheetTaskService.deleteTimesheetTask(req.params.id);
    res.status(200).success("Timesheet task deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllTimesheetTask = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await timeSheetTaskService.getAllTimesheetTask(
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
  createTimeSheetTask,
  findTimesheetTask,
  updateTimesheetTask,
  deleteTimesheetTask,
  getAllTimesheetTask,
};
