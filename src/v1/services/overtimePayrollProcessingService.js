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
const callOvertimePostingSP = async (params) => {
  try {
    const {
      paymonth,
      payyear,
      empidfrom,
      empidto,
      depidfrom,
      depidto,
      positionidfrom,
      positionidto,
      wage = "",
    } = params;
    await overtimePayrollProcessingModel.callOvertimePostingSP({
      paymonth,
      payyear,
      empidfrom,
      empidto,
      depidfrom,
      depidto,
      positionidfrom,
      positionidto,
      wage,
    });
    return {
      success: true,
      message: "Overtime payroll processed successfully.",
    };
  } catch (error) {}
};

module.exports = {
  createOvertimePayrollProcessing,
  findOvertimePayrollProcessingById,
  updateOvertimePayrollProcessing,
  deleteOvertimePayrollProcessing,
  getAllOvertimePayrollProcessing,
  callOvertimePostingSP,
};
