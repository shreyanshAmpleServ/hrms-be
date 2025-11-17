const hiringStageModel = require("../models/hiringStageModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

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

const updateHiringStageStatus = async (id, data) => {
  return await hiringStageModel.updateHiringStageStatus(id, data);
};

module.exports = {
  createHiringStage,
  getHiringStageById,
  updateHiringStage,
  deleteHiringStage,
  getAllHiringStages,
  updateHiringStageStatus,
};
