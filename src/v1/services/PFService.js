const PFModel = require("../models/PFModel");

const createPF = async (data) => {
  return await PFModel.createPF(data);
};

const findPFById = async (id) => {
  return await PFModel.findPFById(id);
};

const updatePF = async (id, data) => {
  return await PFModel.updatePF(id, data);
};

const deletePF = async (id) => {
  return await PFModel.deletePF(id);
};

const getAllPF = async (page, size, search, startDate, endDate, is_active) => {
  return await PFModel.getAllPF(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createPF,
  findPFById,
  updatePF,
  deletePF,
  getAllPF,
};
