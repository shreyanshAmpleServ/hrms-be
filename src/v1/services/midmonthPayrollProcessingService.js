const midmonthPayrollProcessingModel = require("../models/midmonthPayrollProcessingModel.js");

const createMidMonthPayrollProcessing = async (data) => {
  return await midmonthPayrollProcessingModel.createMidMonthPayrollProcessing(
    data
  );
};

const findMidMonthPayrollProcessing = async (id) => {
  return await midmonthPayrollProcessingModel.findMidMonthPayrollProcessing(id);
};

const updateMidMonthPayrollProcessing = async (id, data) => {
  return await midmonthPayrollProcessingModel.updateMidMonthPayrollProcessing(
    id,
    data
  );
};

const deleteMidMonthPayrollProcessing = async (id) => {
  return await midmonthPayrollProcessingModel.deleteMidMonthPayrollProcessing(
    id
  );
};

const getAllMidMonthPayrollProcessing = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await midmonthPayrollProcessingModel.getAllMidMonthPayrollProcessing(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createMidMonthPayrollProcessing,
  findMidMonthPayrollProcessing,
  updateMidMonthPayrollProcessing,
  deleteMidMonthPayrollProcessing,
  getAllMidMonthPayrollProcessing,
};
