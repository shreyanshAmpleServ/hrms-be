const midmonthPayrollProcessingModel = require("../models/midmonthPayrollProcessingModel.js");

const createMidMonthPayrollProcessing = async (data) => {
  return await midmonthPayrollProcessingModel.createMidMonthPayrollProcessing(
    data
  );
};

const findMidMonthPayrollProcessingById = async (id) => {
  console.log("🔍 Inside service: finding midmonth payroll by ID", id);

  return await midmonthPayrollProcessingModel.findMidMonthPayrollProcessingById(
    id
  );
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
  findMidMonthPayrollProcessingById,
  updateMidMonthPayrollProcessing,
  deleteMidMonthPayrollProcessing,
  getAllMidMonthPayrollProcessing,
};
