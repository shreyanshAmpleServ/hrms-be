const surveyResponseService = require("../services/surveyResponseService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");

const createSurveyResponse = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await surveyResponseService.createSurveyResponse(data);
    res.status(201).success("Survey response created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findSurveyResponse = async (req, res, next) => {
  try {
    const reqData = await surveyResponseService.findSurveyResponseById(
      req.params.id,
    );
    if (!reqData) throw new CustomError("Survey response not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateSurveyResponse = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await surveyResponseService.updateSurveyResponse(
      req.params.id,
      data,
    );
    res.status(200).success("Survey response updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteSurveyResponse = async (req, res, next) => {
  try {
    await surveyResponseService.deleteSurveyResponse(req.params.id);
    res.status(200).success("Survey response deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllSurveyResponses = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await surveyResponseService.getAllSurveyResponses(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSurveyResponse,
  findSurveyResponse,
  updateSurveyResponse,
  deleteSurveyResponse,
  getAllSurveyResponses,
};
