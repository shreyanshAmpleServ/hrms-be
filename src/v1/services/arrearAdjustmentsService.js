const arrearAdjustmentsModel = require("../models/arrearAdjustmentsModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createArrearAdjustment = async (data) => {
  return await arrearAdjustmentsModel.createArrearAdjustment(data);
};

const findArrearAdjustmentById = async (id) => {
  return await arrearAdjustmentsModel.findArrearAdjustmentById(id);
};

const updateArrearAdjustment = async (id, data) => {
  return await arrearAdjustmentsModel.updateArrearAdjustment(id, data);
};

const deleteArrearAdjustment = async (id) => {
  return await arrearAdjustmentsModel.deleteArrearAdjustment(id);
};

const getAllArrearAdjustment = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await arrearAdjustmentsModel.getAllArrearAdjustment(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createArrearAdjustment,
  findArrearAdjustmentById,
  updateArrearAdjustment,
  deleteArrearAdjustment,
  getAllArrearAdjustment,
};
