
const awardTypeModel = require('../models/awardTypeModel');

const createAwardType = async (data) => {
  return await awardTypeModel.createAwardType(data);
};

const findAwardTypeById = async (id) => {
  return await awardTypeModel.findAwardTypeById(id);
};

const updateAwardType = async (id, data) => {
  return await awardTypeModel.updateAwardType(id, data);
};

const deleteAwardType = async (id) => {
  return await awardTypeModel.deleteAwardType(id);
};

const getAllAwardType = async (page, size, search,  startDate,endDate) => {
  return await awardTypeModel.getAllAwardType(page, size, search,  startDate,endDate);
};

module.exports = {
  createAwardType,
  findAwardTypeById,
  updateAwardType,
  deleteAwardType,
  getAllAwardType,
};