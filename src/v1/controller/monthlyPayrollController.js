const monthlyPayrollService = require("../services/monthlyPayrollService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createMonthlyPayroll = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await monthlyPayrollService.createMonthlyPayroll(data);
    res.status(201).success("Monthly payroll created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findMonthlyPayroll = async (req, res, next) => {
  try {
    const reqData = await monthlyPayrollService.findMonthlyPayrollById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Monthly payroll not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateMonthlyPayroll = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await monthlyPayrollService.updateMonthlyPayroll(
      req.params.id,
      data
    );
    res.status(200).success("Monthly payroll updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteMonthlyPayroll = async (req, res, next) => {
  try {
    await monthlyPayrollService.deleteMonthlyPayroll(req.params.id);
    res.status(200).success("Monthly payroll deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllMonthlyPayroll = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await monthlyPayrollService.getAllMonthlyPayroll(
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
  createMonthlyPayroll,
  findMonthlyPayroll,
  updateMonthlyPayroll,
  deleteMonthlyPayroll,
  getAllMonthlyPayroll,
};
