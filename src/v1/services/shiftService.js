const shiftModel = require("../models/shiftModel");
const { getPrisma } = require("../../config/prismaContext.js");

const createShift = async (data) => {
  return await shiftModel.createShift(data);
};

const findShiftById = async (id) => {
  return await shiftModel.findShiftById(id);
};

const updateShift = async (id, data) => {
  return await shiftModel.updateShift(id, data);
};

const deleteShift = async (id) => {
  return await shiftModel.deleteShift(id);
};

const getAllShift = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await shiftModel.getAllShift(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createShift,
  findShiftById,
  updateShift,
  deleteShift,
  getAllShift,
};
