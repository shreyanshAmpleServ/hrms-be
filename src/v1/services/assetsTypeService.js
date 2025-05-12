
const assetsTypeModel = require('../models/assetsTypeModel');

const createAssetsType = async (data) => {
  return await assetsTypeModel.createAssetsType(data);
};

const findAssetsTypeById = async (id) => {
  return await assetsTypeModel.findAssetsTypeById(id);
};

const updateAssetsType = async (id, data) => {
  return await assetsTypeModel.updateAssetsType(id, data);
};

const deleteAssetsType = async (id) => {
  return await assetsTypeModel.deleteAssetsType(id);
};

const getAllAssetsType = async (page, size, search,  startDate,endDate) => {
  return await assetsTypeModel.getAllAssetsType(page, size, search,  startDate,endDate);
};

module.exports = {
  createAssetsType,
  findAssetsTypeById,
  updateAssetsType,
  deleteAssetsType,
  getAllAssetsType,
};