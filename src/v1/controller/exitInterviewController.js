const exitInterviewService = require("../services/exitInterviewService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createExitInterview = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await exitInterviewService.createExitInterview(data);
    res.status(201).success("Exit interview created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findExitInterview = async (req, res, next) => {
  try {
    const reqData = await exitInterviewService.findExitInterviewById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Exit interview not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateExitInterview = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await exitInterviewService.updateExitInterview(
      req.params.id,
      data
    );
    res.status(200).success("Exit interview updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteExitInterview = async (req, res, next) => {
  try {
    await exitInterviewService.deleteExitInterview(req.params.id);
    res.status(200).success("Exit interview deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllExitInterviews = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await exitInterviewService.getAllExitInterviews(
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
  createExitInterview,
  findExitInterview,
  updateExitInterview,
  deleteExitInterview,
  getAllExitInterviews,
};
