const loanMasterModel = require("../models/loanMasterModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createLoanMaster = async (data) => {
  return await loanMasterModel.createLoanMaster(data);
};

const findLoanMasterById = async (id) => {
  return await loanMasterModel.findLoanMasterById(id);
};

const updateLoanMaster = async (id, data) => {
  return await loanMasterModel.updateLoanMaster(id, data);
};

const deleteLoanMaster = async (id) => {
  return await loanMasterModel.deleteLoanMaster(id);
};
//comment

const getAllLoanMaster = async (search, page, size, startDate, endDate) => {
  return await loanMasterModel.getAllLoanMaster(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createLoanMaster,
  findLoanMasterById,
  updateLoanMaster,
  deleteLoanMaster,
  getAllLoanMaster,
};
