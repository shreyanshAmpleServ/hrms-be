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
    const result = await overtimePayrollProcessingModel.callOvertimePostingSP(
      params
    );

    console.log(" Service layer result:", result);

    return {
      success: true,
      message: "Overtime payroll processed successfully.",
      result: result,
    };
  } catch (error) {
    throw new CustomError(`SP execution failed: ${error.message}`, 500);
  }
};

module.exports = {
  createOvertimePayrollProcessing,
  findOvertimePayrollProcessingById,
  updateOvertimePayrollProcessing,
  deleteOvertimePayrollProcessing,
  getAllOvertimePayrollProcessing,
  callOvertimePostingSP,
};
