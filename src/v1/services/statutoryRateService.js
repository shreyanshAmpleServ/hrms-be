const statutoryRateModel = require("../models/statutoryRateModel");
const { getPrisma } = require("../../config/prismaContext.js");

const createStatutoryRate = async (data) => {
  return await statutoryRateModel.createStatutoryRate(data);
};

const findStatutoryRateById = async (id) => {
  return await statutoryRateModel.findStatutoryRateById(id);
};

const updateStatutoryRate = async (id, data) => {
  return await statutoryRateModel.updateStatutoryRate(id, data);
};

const deleteStatutoryRate = async (id) => {
  return await statutoryRateModel.deleteStatutoryRate(id);
};

const getAllStatutoryRate = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await statutoryRateModel.getAllStatutoryRate(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createStatutoryRate,
  findStatutoryRateById,
  updateStatutoryRate,
  deleteStatutoryRate,
  getAllStatutoryRate,
};
