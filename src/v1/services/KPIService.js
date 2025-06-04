const KPIModel = require("../models/KPIModel");

const createKPI = async (data) => {
  return await KPIModel.createKPI(data);
};

const findKPIById = async (id) => {
  return await KPIModel.findKPIById(id);
};

const updateKPI = async (id, data) => {
  return await KPIModel.updateKPI(id, data);
};

const deleteKPI = async (id) => {
  return await KPIModel.deleteKPI(id);
};

const getAllKPI = async (page, size, search, startDate, endDate) => {
  return await KPIModel.getAllKPI(page, size, search, startDate, endDate);
};

module.exports = {
  createKPI,
  findKPIById,
  updateKPI,
  deleteKPI,
  getAllKPI,
};
