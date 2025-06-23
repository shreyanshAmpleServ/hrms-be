const loanReqService = require("../services/loanReqService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createLoanRequest = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await loanReqService.createLoanRequest(data);
    res.status(201).success("Loan request created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findLoanRequestById = async (req, res, next) => {
  try {
    const reqData = await loanReqService.findLoanRequestById(req.params.id);
    if (!reqData) throw new CustomError("Loan request not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateLoanRequest = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await loanReqService.updateLoanRequest(req.params.id, data);
    res.status(200).success("Loan request updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteLoanRequest = async (req, res, next) => {
  try {
    await loanReqService.deleteLoanRequest(req.params.id);
    res.status(200).success("Loan request deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllLoanRequest = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await loanReqService.getAllLoanRequest(
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

const updateLoanReqStatus = async (req, res, next) => {
  try {
    console.log("Approver ID from token:", req.user.employee_id);
    const status = req.body.status;

    const data = {
      status,
      updatedby: req.user.employee_id,
      updatedate: new Date(),
    };
    const reqData = await loanReqService.updateLoanReqStatus(
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
  createLoanRequest,
  findLoanRequestById,
  updateLoanRequest,
  deleteLoanRequest,
  getAllLoanRequest,
  updateLoanReqStatus,
};
