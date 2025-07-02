const loanEmiScheduleService = require("../services/loanEmiScheduleService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createLoanEmiSchedule = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await loanEmiScheduleService.createLoanEmiSchedule(data);
    res.status(201).success("Loan request created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findLoanEmiScheduleById = async (req, res, next) => {
  try {
    const reqData = await loanEmiScheduleService.findLoanEmiScheduleById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Loan request not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateLoanEmiSchedule = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await loanEmiScheduleService.updateLoanEmiSchedule(
      req.params.id,
      data
    );
    res.status(200).success("Loan request updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteLoanEmiSchedule = async (req, res, next) => {
  try {
    await loanEmiScheduleService.deleteLoanEmiSchedule(req.params.id);
    res.status(200).success("Loan request deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllLoanEmiSchedule = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await loanEmiScheduleService.getAllLoanEmiSchedule(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate)
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateLoanEmiScheduleStatus = async (req, res, next) => {
  try {
    console.log("Approver ID from token:", req.user.employee_id);
    const status = req.body.status;

    const data = {
      status,
      updatedby: req.user.employee_id,
      updatedate: new Date(),
    };
    const reqData = await loanEmiScheduleService.updateLoanEmiScheduleStatus(
      req.params.id,
      data
    );
    res
      .status(200)
      .success("Loan request status updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLoanEmiSchedule,
  findLoanEmiScheduleById,
  updateLoanEmiSchedule,
  deleteLoanEmiSchedule,
  getAllLoanEmiSchedule,
  updateLoanEmiScheduleStatus,
};
