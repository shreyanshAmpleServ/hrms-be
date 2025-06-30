const overtimePayrollProcessingModel = require("../models/overtimePayrollProcessingModel.js");

const createOvertimePayrollProcessing = async (data) => {
  return await overtimePayrollProcessingModel.createOvertimePayrollProcessing(
    data
  );
};

const findOvertimePayrollProcessingById = async (id) => {
  return await overtimePayrollProcessingModel.findOvertimePayrollProcessingById(
    id
  );
};

const updateOvertimePayrollProcessing = async (id, data) => {
  return await overtimePayrollProcessingModel.updateOvertimePayrollProcessing(
    id,
    data
  );
};

const deleteOvertimePayrollProcessing = async (id) => {
  return await overtimePayrollProcessingModel.deleteOvertimePayrollProcessing(
    id
  );
};

const getAllOvertimePayrollProcessing = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await overtimePayrollProcessingModel.getAllOvertimePayrollProcessing(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createOvertimePayrollProcessing,
  findOvertimePayrollProcessingById,
  updateOvertimePayrollProcessing,
  deleteOvertimePayrollProcessing,
  getAllOvertimePayrollProcessing,
};
