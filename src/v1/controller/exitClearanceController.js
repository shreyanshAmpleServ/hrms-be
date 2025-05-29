const exitClearanceService = require("../services/exitClearanceService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createExitClearance = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await exitClearanceService.createExitClearance(data);
    res.status(201).success("Exit clearance created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findExitClearance = async (req, res, next) => {
  try {
    const reqData = await exitClearanceService.findExitClearanceById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Exit clearance not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateExitClearance = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await exitClearanceService.updateExitClearance(
      req.params.id,
      data
    );
    res.status(200).success("Exit clearance updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteExitClearance = async (req, res, next) => {
  try {
    await exitClearanceService.deleteExitClearance(req.params.id);
    res.status(200).success("Exit clearance deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllExitClearance = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await exitClearanceService.getAllExitClearance(
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
  createExitClearance,
  findExitClearance,
  updateExitClearance,
  deleteExitClearance,
  getAllExitClearance,
};
