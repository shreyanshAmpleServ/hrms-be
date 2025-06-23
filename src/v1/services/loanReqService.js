const loanReqModel = require("../models/loanReqModel");

const createLoanRequest = async (data) => {
  return await loanReqModel.createLoanRequest(data);
};

const findLoanRequestById = async (id) => {
  return await loanReqModel.findLoanRequestById(id);
};

const updateLoanRequest = async (id, data) => {
  return await loanReqModel.updateLoanRequest(id, data);
};

const deleteLoanRequest = async (id) => {
  return await loanReqModel.deleteLoanRequest(id);
};

const getAllLoanRequest = async (search, page, size, startDate, endDate) => {
  return await loanReqModel.getAllLoanRequest(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

const updateLoanReqStatus = async (id, data) => {
  return await loanReqModel.updateLoanReqStatus(id, data);
};

module.exports = {
  createLoanRequest,
  findLoanRequestById,
  updateLoanRequest,
  deleteLoanRequest,
  updateLoanReqStatus,
  getAllLoanRequest,
};
