const hiringStageModel = require("../models/hiringStageModel.js");

const createHiringStage = async (data) => {
  return await hiringStageModel.createHiringStage(data);
};

const getHiringStageById = async (id) => {
  return await hiringStageModel.getHiringStageById(id);
};

const updateHiringStage = async (id, data) => {
  return await hiringStageModel.updateHiringStage(id, data);
};

const deleteHiringStage = async (id) => {
  return await hiringStageModel.deleteHiringStage(id);
};

// FIXED: Parameter order matches model
const getAllHiringStages = async (
  search,
  page,
  size,
  startDate,
  endDate,
  status
) => {
  return await hiringStageModel.getAllHiringStages(
    search,
    page,
    size,
    startDate,
    endDate,
    status
  );
};

module.exports = {
  createHiringStage,
  getHiringStageById,
  updateHiringStage,
  deleteHiringStage,
  getAllHiringStages,
};
