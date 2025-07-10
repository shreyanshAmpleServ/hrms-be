const midmonthPayrollProcessingModel = require("../models/midmonthPayrollProcessingModel.js");

const createMidMonthPayrollProcessing = async (data) => {
  return await midmonthPayrollProcessingModel.createMidMonthPayrollProcessing(
    data
  );
};

const findMidMonthPayrollProcessingById = async (id) => {
  console.log("Inside service: finding midmonth payroll by ID", id);

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
  endDate,
  payroll_month,
  payroll_year
) => {
  return await midmonthPayrollProcessingModel.getAllMidMonthPayrollProcessing(
    search,
    page,
    size,
    startDate,
    endDate,
    payroll_month,
    payroll_year
  );
};

const callMidMonthPostingSP = async (params) => {
  try {
    const result = await midmonthPayrollProcessingModel.callMidMonthPostingSP(
      params
    );

    console.log(" Service layer result:", result);

    return {
      success: true,
      message: "Mid-month payroll processed successfully.",
      result: result,
    };
  } catch (error) {
    throw new CustomError(`SP execution failed: ${error.message}`, 500);
  }
};

module.exports = {
  createMidMonthPayrollProcessing,
  findMidMonthPayrollProcessingById,
  updateMidMonthPayrollProcessing,
  deleteMidMonthPayrollProcessing,
  getAllMidMonthPayrollProcessing,
  callMidMonthPostingSP,
};
