const loanCashPayementService = require("../services/loanCashPayementService.js");
const CustomError = require("../../utils/CustomError");
const { logActivity } = require("../../utils/activityLogger");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createLoanCashPayement = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await loanCashPayementService.createLoanCashPayement(data);
    res.status(201).success("Loan Cash Payement created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findLoanCashPayement = async (req, res, next) => {
  try {
    const reqData = await loanCashPayementService.findLoanCashPayement(
      req.params.id
    );
    if (!reqData) throw new CustomError("Loan Cash Payement  not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateLoanCashPayement = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await loanCashPayementService.updateLoanCashPayement(
      req.params.id,
      data
    );
    res.status(200).success("Loan Cash Payement  not found", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteLoanCashPayement = async (req, res, next) => {
  try {
    await loanCashPayementService.deleteLoanCashPayement(req.params.id);
    res.status(200).success("Loan Cash Payement deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllLoanCashPayement = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, loan_request_id } =
      req.query;
    const data = await loanCashPayementService.getAllLoanCashPayement(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      loan_request_id
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLoanCashPayement,
  getAllLoanCashPayement,
  findLoanCashPayement,
  updateLoanCashPayement,
  deleteLoanCashPayement,
};
