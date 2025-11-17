const surveyService = require("../services/surveyService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createSurvey = async (req, res, next) => {
  try {
    let reqData = { ...req.body };
    const data = await surveyService.createSurvey(reqData);
    res.status(201).success("Survey created successfully", data);
  } catch (error) {
    next(error);
  }
};

const findSurveyById = async (req, res, next) => {
  try {
    const data = await surveyService.findSurveyById(req.params.id);
    if (!data) throw new CustomError("Survey not found", 404);

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateSurvey = async (req, res, next) => {
  try {
    let reqData = { ...req.body };

    const data = await surveyService.updateSurvey(req.params.id, reqData);
    res.status(200).success("Survey updated successfully", data);
  } catch (error) {
    next(error);
  }
};

const deleteSurvey = async (req, res, next) => {
  try {
    await surveyService.deleteSurvey(req.params.id);
    res.status(200).success("Survey deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllSurvey = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const data = await surveyService.getAllSurvey(
      Number(page),
      Number(size),
      search,
      moment(startDate),
      moment(endDate),
      is_active
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSurvey,
  findSurveyById,
  updateSurvey,
  deleteSurvey,
  getAllSurvey,
};
