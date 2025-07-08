const overtimePayrollProcessingService = require("../services/overtimePayrollProcessingService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createOvertimePayrollProcessing = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData =
      await overtimePayrollProcessingService.createOvertimePayrollProcessing(
        data
      );
    res
      .status(201)
      .success("MidMonth Payroll Processing created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findOvertimePayrollProcessing = async (req, res, next) => {
  try {
    const reqData =
      await overtimePayrollProcessingService.findOvertimePayrollProcessingById(
        req.params.id
      );
    res.status(200).json({ success: true, reqData });
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

const updateOvertimePayrollProcessing = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData =
      await overtimePayrollProcessingService.updateOvertimePayrollProcessing(
        req.params.id,
        data
      );
    res
      .status(200)
      .success("MidMonth Payroll Processing updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteOvertimePayrollProcessing = async (req, res, next) => {
  try {
    await overtimePayrollProcessingService.deleteOvertimePayrollProcessing(
      req.params.id
    );
    res
      .status(200)
      .success("MidMonth Payroll Processing deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllOvertimePayrollProcessing = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data =
      await overtimePayrollProcessingService.getAllOvertimePayrollProcessing(
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
  createOvertimePayrollProcessing,
  updateOvertimePayrollProcessing,
  findOvertimePayrollProcessing,
  updateOvertimePayrollProcessing,
  getAllOvertimePayrollProcessing,
  deleteOvertimePayrollProcessing,
};
