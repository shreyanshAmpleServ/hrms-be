const salaryStructureModel = require('../models/salaryStructureModel');

const createSalaryStructure = async (data) => {
  return await salaryStructureModel.createSalaryStructure(data);
};

const findSalaryStructureById = async (id) => {
  return await salaryStructureModel.findSalaryStructureById(id);
};

const updateSalaryStructure = async (id, data) => {
  return await salaryStructureModel.updateSalaryStructure(id, data);
};

const deleteSalaryStructure = async (id) => {
  return await salaryStructureModel.deleteSalaryStructure(id);
};

const getAllSalaryStructure = async (page, size, search,  startDate,endDate) => {
  return await salaryStructureModel.getAllSalaryStructure(page, size, search,  startDate,endDate);
};

module.exports = {
  createSalaryStructure,
  findSalaryStructureById,
  updateSalaryStructure,
  deleteSalaryStructure,
  getAllSalaryStructure,
};