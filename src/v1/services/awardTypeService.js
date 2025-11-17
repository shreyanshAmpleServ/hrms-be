const awardTypeModel = require("../models/awardTypeModel");
const { getPrisma } = require("../../config/prismaContext.js");

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

const getAllAwardType = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await awardTypeModel.getAllAwardType(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createAwardType,
  findAwardTypeById,
  updateAwardType,
  deleteAwardType,
  getAllAwardType,
};
