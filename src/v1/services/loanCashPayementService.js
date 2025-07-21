const loanCashPayementModel = require("../models/loanCashPayementModel.js");

const createLoanCashPayement = async (data) => {
  return await loanCashPayementModel.createLoanCashPayement(data);
};

const findLoanCashPayement = async (id) => {
  return await loanCashPayementModel.findLoanCashPayement(id);
};

const updateLoanCashPayement = async (id, data) => {
  return await loanCashPayementModel.updateLoanCashPayement(id, data);
};

const deleteLoanCashPayement = async (id) => {
  return await loanCashPayementModel.deleteLoanCashPayement(id);
};

const getAllLoanCashPayement = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await loanCashPayementModel.getAllLoanCashPayement(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createLoanCashPayement,
  findLoanCashPayement,
  updateLoanCashPayement,
  getAllLoanCashPayement,
  deleteLoanCashPayement,
};
