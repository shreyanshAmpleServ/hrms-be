const surveyResponseModel = require("../models/surveyResponseModel.js");

const createSurveyResponse = async (data) => {
  return await surveyResponseModel.createSurveyResponse(data);
};

const findSurveyResponseById = async (id) => {
  return await surveyResponseModel.findSurveyResponseById(id);
};

const updateSurveyResponse = async (id, data) => {
  return await surveyResponseModel.updateSurveyResponse(id, data);
};

const deleteSurveyResponse = async (id) => {
  return await surveyResponseModel.deleteSurveyResponse(id);
};

const getAllSurveyResponses = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await surveyResponseModel.getAllSurveyResponses(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createSurveyResponse,
  findSurveyResponseById,
  updateSurveyResponse,
  deleteSurveyResponse,
  getAllSurveyResponses,
};
