const loanEmiScheduleModel = require("../models/loanEmiScheduleModel.js");

const createLoanEmiSchedule = async (data) => {
  return await loanEmiScheduleModel.createLoanEmiSchedule(data);
};

const findLoanEmiScheduleById = async (id) => {
  return await loanEmiScheduleModel.findLoanEmiScheduleById(id);
};

const updateLoanEmiSchedule = async (id, data) => {
  return await loanEmiScheduleModel.updateLoanEmiSchedule(id, data);
};

const deleteLoanEmiSchedule = async (id) => {
  return await loanEmiScheduleModel.deleteLoanEmiSchedule(id);
};

const getAllLoanEmiSchedule = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await loanEmiScheduleModel.getAllLoanEmiSchedule(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

const updateLoanEmiScheduleStatus = async (id, data) => {
  return await loanEmiScheduleModel.updateLoanEmiScheduleStatus(id, data);
};

module.exports = {
  createLoanEmiSchedule,
  findLoanEmiScheduleById,
  updateLoanEmiSchedule,
  getAllLoanEmiSchedule,
  deleteLoanEmiSchedule,
  updateLoanEmiScheduleStatus,
};
