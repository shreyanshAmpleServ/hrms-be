const kpiProgressModel = require("../models/kpiProgressModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createKpiProgress = async (data) => {
  return await kpiProgressModel.createKpiProgress(data);
};

const findKpiProgressById = async (id) => {
  return await kpiProgressModel.findKpiProgressById(id);
};

const updateKpiProgress = async (id, data) => {
  return await kpiProgressModel.updateKpiProgress(id, data);
};

const deleteKpiProgress = async (id) => {
  return await kpiProgressModel.deleteKpiProgress(id);
};

const getAllKpiProgress = async (search, page, size, startDate, endDate) => {
  return await kpiProgressModel.getAllKpiProgress(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createKpiProgress,
  findKpiProgressById,
  updateKpiProgress,
  deleteKpiProgress,
  getAllKpiProgress,
};
