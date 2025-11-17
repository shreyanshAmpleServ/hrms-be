const latterTypeModel = require("../models/latterTypeModel");
const { getPrisma } = require("../../config/prismaContext.js");

const createLatterType = async (data) => {
  return await latterTypeModel.createLatterType(data);
};

const findLatterTypeById = async (id) => {
  return await latterTypeModel.findLatterTypeById(id);
};

const updateLatterType = async (id, data) => {
  return await latterTypeModel.updateLatterType(id, data);
};

const deleteLatterType = async (id) => {
  return await latterTypeModel.deleteLatterType(id);
};

const getAllLatterType = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await latterTypeModel.getAllLatterType(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createLatterType,
  findLatterTypeById,
  updateLatterType,
  deleteLatterType,
  getAllLatterType,
};
