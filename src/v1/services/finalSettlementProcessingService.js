const finalSettlementProcessingModel = require("../models/finalSettlementProcessingModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createFinalSettlementProcessing = async (data) => {
  return await finalSettlementProcessingModel.createFinalSettlementProcessing(
    data
  );
};

const findFinalSettlementProcessingById = async (id) => {
  return await finalSettlementProcessingModel.findFinalSettlementProcessingById(
    id
  );
};

const updateFinalSettlementProcessing = async (id, data) => {
  return await finalSettlementProcessingModel.updateFinalSettlementProcessing(
    id,
    data
  );
};

const deleteFinalSettlementProcessing = async (id) => {
  return await finalSettlementProcessingModel.deleteFinalSettlementProcessing(
    id
  );
};

const getAllFinalSettlementProcessing = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await finalSettlementProcessingModel.getAllFinalSettlementProcessing(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createFinalSettlementProcessing,
  findFinalSettlementProcessingById,
  updateFinalSettlementProcessing,
  deleteFinalSettlementProcessing,
  getAllFinalSettlementProcessing,
};
