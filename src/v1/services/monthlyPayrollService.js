const monthlyPayrollModel = require("../models/monthlyPayrollModel.js");
const CustomError = require("../../utils/CustomError");

const createMonthlyPayroll = async (data) => {
  return await monthlyPayrollModel.createMonthlyPayroll(data);
};

const findMonthlyPayrollById = async (id) => {
  return await monthlyPayrollModel.findMonthlyPayrollById(id);
};

const updateMonthlyPayroll = async (id, data) => {
  return await monthlyPayrollModel.updateMonthlyPayroll(id, data);
};

const deleteMonthlyPayroll = async (id) => {
  return await monthlyPayrollModel.deleteMonthlyPayroll(id);
};

const getAllMonthlyPayroll = async (
  search,
  page,
  size,
  startDate,
  endDate,
  payroll_month,
  payroll_year
) => {
  return await monthlyPayrollModel.getAllMonthlyPayroll(
    search,
    page,
    size,
    startDate,
    endDate,
    payroll_month,
    payroll_year
  );
};

const callMonthlyPayrollSP = async (params) => {
  try {
    const result = await monthlyPayrollModel.callMonthlyPayrollSP(params);

    console.log("Service layer result:", result);

    return {
      success: true,
      message: "Monthly payroll processed successfully.",
      result: result,
    };
  } catch (error) {
    throw new CustomError(`SP execution failed: ${error.message}`, 500);
  }
};

const triggerMonthlyPayrollCalculationSP = async (params) => {
  try {
    const result = await monthlyPayrollModel.triggerMonthlyPayrollCalculationSP(
      params
    );
    return {
      message: "Taxable amount SP executed successfully",
      result: result,
    };
  } catch (error) {
    throw new CustomError(
      `Calculation SP execution failed: ${error.message}`,
      500
    );
  }
};

const getComponentNames = async () => {
  return await monthlyPayrollModel.getComponentNames();
};
const createOrUpdatePayrollBulk = async (rows, user) => {
  return await monthlyPayrollModel.createOrUpdatePayrollBulk(rows, user);
};

const getGeneratedMonthlyPayroll = async (
  search,
  page,
  size,
  startDate,
  endDate,
  payroll_month,
  payroll_year
) => {
  return await monthlyPayrollModel.getGeneratedMonthlyPayroll(
    search,
    page,
    size,
    startDate,
    endDate,
    payroll_month,
    payroll_year
  );
};
module.exports = {
  createMonthlyPayroll,
  findMonthlyPayrollById,
  updateMonthlyPayroll,
  deleteMonthlyPayroll,
  getAllMonthlyPayroll,
  callMonthlyPayrollSP,
  getComponentNames,
  triggerMonthlyPayrollCalculationSP,
  createOrUpdatePayrollBulk,
  getGeneratedMonthlyPayroll,
};
