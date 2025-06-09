const TimeSheetService = require("../services/TimeSheetService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createTimeSheet = async (req, res, next) => {
  try {
    console.log("Creating time sheet with data:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await TimeSheetService.createTimeSheet(data);
    res.status(201).success("Time sheet created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findTimeSheetById = async (req, res, next) => {
  try {
    const reqData = await TimeSheetService.findTimeSheetById(req.params.id);
    if (!reqData) throw new CustomError("Time sheet not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateTimeSheet = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await TimeSheetService.updateTimeSheet(req.params.id, data);
    res.status(200).success("Time sheet updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteTimeSheet = async (req, res, next) => {
  try {
    await TimeSheetService.deleteTimeSheet(req.params.id);
    res.status(200).success("Time sheet deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllTimeSheet = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await TimeSheetService.getAllTimeSheet(
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
  createTimeSheet,
  findTimeSheetById,
  updateTimeSheet,
  deleteTimeSheet,
  getAllTimeSheet,
};
