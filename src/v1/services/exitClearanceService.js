const exitClearanceModel = require("../models/exitClearanceModal.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createExitClearance = async (data) => {
  return await exitClearanceModel.createExitClearance(data);
};

const findExitClearanceById = async (id) => {
  return await exitClearanceModel.findExitClearanceById(id);
};

const updateExitClearance = async (id, data) => {
  return await exitClearanceModel.updateExitClearance(id, data);
};

const deleteExitClearance = async (id) => {
  return await exitClearanceModel.deleteExitClearance(id);
};

const getAllExitClearance = async (search, page, size, startDate, endDate) => {
  return await exitClearanceModel.getAllExitClearance(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

const checkBulkClearance = async (employeeIds, month, year) => {
  return await exitClearanceModel.checkBulkClearance(employeeIds, month, year);
};

module.exports = {
  createExitClearance,
  findExitClearanceById,
  updateExitClearance,
  deleteExitClearance,
  getAllExitClearance,
  checkBulkClearance,
};
