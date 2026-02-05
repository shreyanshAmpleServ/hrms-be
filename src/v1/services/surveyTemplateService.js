const surveyTemplateModel = require("../models/surveyTemplateModal");

const createSurveyTemplate = async (data) => {
  return await surveyTemplateModel.createSurveyTemplate(data);
};

const findSurveyById = async (id) => {
  return await surveyTemplateModel.findSurveyById(id);
};

const updateSurveyTemplate = async (id, data) => {
  return await surveyTemplateModel.updateSurveyTemplate(id, data);
};
const replaceSurveyQuestions = async (id, data) => {
  return await surveyTemplateModel.replaceSurveyQuestions(id, data);
};

const deleteSurveyTemplate = async (id) => {
  return await surveyTemplateModel.deleteSurveyTemplate(id);
};

const getAllSurveyTemplates = async (search, page, size) => {
  return await surveyTemplateModel.getAllSurveyTemplates(search, page, size);
};

module.exports = {
  createSurveyTemplate,
  findSurveyById,
  updateSurveyTemplate,
  replaceSurveyQuestions,
  deleteSurveyTemplate,
  getAllSurveyTemplates,
};
