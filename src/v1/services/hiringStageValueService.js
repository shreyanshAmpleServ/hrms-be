const hiringStageValueModel = require("../models/hiringStageValueModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createHiringStageValue = async (data) => {
  return await hiringStageValueModel.createHiringStageValue(data);
};

const getHiringStageValueById = async (id) => {
  return await hiringStageValueModel.getHiringStageValueById(id);
};

const updateHiringStageValue = async (id, data) => {
  return await hiringStageValueModel.updateHiringStageValue(id, data);
};

const deleteHiringStageValue = async (id) => {
  return await hiringStageValueModel.deleteHiringStageValue(id);
};

const getAllHiringStageValues = async (
  search,
  page,
  size,
  startDate,
  endDate,
  status
) => {
  return await hiringStageValueModel.getAllHiringStageValues(
    search,
    page,
    size,
    startDate,
    endDate,
    status
  );
};

module.exports = {
  createHiringStageValue,
  getHiringStageValueById,
  updateHiringStageValue,
  deleteHiringStageValue,
  getAllHiringStageValues,
};
