const casesModel = require('../models/casesModel');

const createCases = async (data) => {
  return await casesModel.createCases(data);
};

const findCasesById = async (id) => {
  return await casesModel.findCasesById(id);
};

const updateCases = async (id, data) => {
  return await casesModel.updateCases(id, data);
};

const deleteCase = async (id) => {
  return await casesModel.deleteCase(id);
};

const getAllCases = async (search ,page , size,startDate,endDate) => {
  return await casesModel.getAllCases(search ,page , size,startDate,endDate);
};
const getAllCaseReasons = async () => {
  return await casesModel.getAllCaseReasons();
};
const generateCaseNumber = async () => {
  return await casesModel.generateCaseNumber();
};


module.exports = {
  createCases,
  findCasesById,
  updateCases,
  deleteCase,
  getAllCases,
  getAllCaseReasons,
  generateCaseNumber
};
