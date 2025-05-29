const exitInterviewModel = require("../models/exitInterviewModel.js");

const createExitInterview = async (data) => {
  return await exitInterviewModel.createExitInterview(data);
};

const findExitInterviewById = async (id) => {
  return await exitInterviewModel.findExitInterviewById(id);
};

const updateExitInterview = async (id, data) => {
  return await exitInterviewModel.updateExitInterview(id, data);
};

const deleteExitInterview = async (id) => {
  return await exitInterviewModel.deleteExitInterview(id);
};

const getAllExitInterviews = async (search, page, size, startDate, endDate) => {
  return await exitInterviewModel.getAllExitInterviews(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createExitInterview,
  findExitInterviewById,
  updateExitInterview,
  deleteExitInterview,
  getAllExitInterviews,
};
