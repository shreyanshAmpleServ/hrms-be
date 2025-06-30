const surveyModel = require("../models/surveyModel");

const createSurvey = async (data) => {
  return await surveyModel.createSurvey(data);
};

const findSurveyById = async (id) => {
  return await surveyModel.findSurveyById(id);
};

const updateSurvey = async (id, data) => {
  return await surveyModel.updateSurvey(id, data);
};

const deleteSurvey = async (id) => {
  return await surveyModel.deleteSurvey(id);
};

const getAllSurvey = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await surveyModel.getAllSurvey(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createSurvey,
  findSurveyById,
  updateSurvey,
  deleteSurvey,
  getAllSurvey,
};
