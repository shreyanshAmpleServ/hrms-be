const loanMasterService = require("../services/loanMasterService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createLoanMaster = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await loanMasterService.createLoanMaster(data);
    res.status(201).success("Loan Master created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findLoanMaster = async (req, res, next) => {
  try {
    const reqData = await loanMasterService.findLoanMasterById(req.params.id);
    if (!reqData) throw new CustomError("Loan Master not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateLoanMaster = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await loanMasterService.updateLoanMaster(
      req.params.id,
      data
    );
    res.status(200).success(" Loan Master updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteLoanMaster = async (req, res, next) => {
  try {
    await loanMasterService.deleteLoanMaster(req.params.id);
    res.status(200).success("Loan Master deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllLoanMaster = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await loanMasterService.getAllLoanMaster(
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

module.exports = {
  createLoanMaster,
  findLoanMaster,
  updateLoanMaster,
  deleteLoanMaster,
  getAllLoanMaster,
};
