const interviewStageService = require("../services/interviewStageService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");

const createInterviewStage = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };

    const reqData = await interviewStageService.createInterviewStage(data);
    res.status(201).success("Interview stage created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findInterviewStageById = async (req, res, next) => {
  try {
    const reqData = await interviewStageService.findInterviewStageById(
      req.params.id
    );

    if (!reqData) throw new CustomError("Interview stage not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateInterviewStage = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await interviewStageService.updateInterviewStage(
      req.params.id,
      data
    );
    res.status(200).success("Interview stage updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteInterviewStage = async (req, res, next) => {
  try {
    const reqData = await interviewStageService.deleteInterviewStage(
      req.params.id
    );
    res.status(200).success("Interview stage deleted successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const getAllInterviewStage = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await interviewStageService.getAllInterviewStage(
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
  createInterviewStage,
  updateInterviewStage,
  findInterviewStageById,
  deleteInterviewStage,
  getAllInterviewStage,
};
