const surveyTemplateService = require("../services/surveyTemplateService.js");
const CustomError = require("../../utils/CustomError.js");

const createSurveyTemplate = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      //   createdby: req.user.id,
      //   log_inst: req.user.log_inst,
    };
    const reqData = await surveyTemplateService.createSurveyTemplate(data);
    res.status(201).success("Survey response created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findSurveyById = async (req, res, next) => {
  try {
    const reqData = await surveyTemplateService.findSurveyById(req.params.id);
    if (!reqData) throw new CustomError("Survey response not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateSurveyTemplate = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      //   updatedby: req.user.id,
      //   log_inst: req.user.log_inst,
    };
    const reqData = await surveyTemplateService.updateSurveyTemplate(
      req.params.id,
      data,
    );
    res.status(200).success("Survey response updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};
const replaceSurveyQuestions = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      //   updatedby: req.user.id,
      //   log_inst: req.user.log_inst,
    };
    const reqData = await surveyTemplateService.replaceSurveyQuestions(
      req.params.id,
      data,
    );
    res.status(200).success("Survey response updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteSurveyTemplate = async (req, res, next) => {
  try {
    await surveyTemplateService.deleteSurveyTemplate(req.params.id);
    res.status(200).success("Survey response deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllSurveyTemplates = async (req, res, next) => {
  try {
    const { page, size, search } = req.query;
    const data = await surveyTemplateService.getAllSurveyTemplates(
      search,
      Number(page),
      Number(size),
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSurveyTemplate,
  findSurveyById,
  updateSurveyTemplate,
  replaceSurveyQuestions,
  deleteSurveyTemplate,
  getAllSurveyTemplates,
};
