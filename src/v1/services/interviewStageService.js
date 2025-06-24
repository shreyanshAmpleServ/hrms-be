const interviewStageModel = require("../models/interviewStageModel.js");

const createInterviewStage = async (data) => {
  return await interviewStageModel.createInterviewStage(data);
};

const findInterviewStageById = async (id) => {
  return await interviewStageModel.findInterviewStageById(id);
};

const updateInterviewStage = async (id, data) => {
  return await interviewStageModel.updateInterviewStage(id, data);
};

const deleteInterviewStage = async (id) => {
  return await interviewStageModel.deleteInterviewStage(id);
};

const getAllInterviewStage = async (search, page, size, startDate, endDate) => {
  return await interviewStageModel.getAllInterviewStage(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createInterviewStage,
  findInterviewStageById,
  updateInterviewStage,
  deleteInterviewStage,
  getAllInterviewStage,
};
