const monthlyPayrollModel = require("../models/probationReviewModel.js");

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

const getAllMonthlyPayroll = async (search, page, size, startDate, endDate) => {
  return await monthlyPayrollModel.getAllMonthlyPayroll(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createMonthlyPayroll,
  findMonthlyPayrollById,
  updateMonthlyPayroll,
  deleteMonthlyPayroll,
  getAllMonthlyPayroll,
};
