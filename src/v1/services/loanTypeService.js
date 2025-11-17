const loanTypeModel = require("../models/loanTypeModel");
const { getPrisma } = require("../../config/prismaContext.js");

const createLoanType = async (data) => {
  return await loanTypeModel.createLoanType(data);
};

const findLoanTypeById = async (id) => {
  return await loanTypeModel.findLoanTypeById(id);
};

const updateLoanType = async (id, data) => {
  return await loanTypeModel.updateLoanType(id, data);
};

const deleteLoanType = async (id) => {
  return await loanTypeModel.deleteLoanType(id);
};

const getAllLoanType = async (
  search,
  page,
  size,
  startDate,
  endDate,
  is_active
) => {
  return await loanTypeModel.getAllLoanType(
    search,
    page,
    size,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createLoanType,
  findLoanTypeById,
  updateLoanType,
  deleteLoanType,
  getAllLoanType,
};
