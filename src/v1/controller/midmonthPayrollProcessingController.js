const midmonthPayrollProcessingService = require("../services/midmonthPayrollProcessingService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createMidMonthPayrollProcessing = async (req, res, next) => {
  try {
    const data = req.body.map((item) => ({
      ...item,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    }));

    const errors =
      await midmonthPayrollProcessingService.createMidMonthPayrollProcessing(
        data
      );

    res.status(201).json({
      success: true,
      message: "MidMonth Payroll Processing completed",
      status: 201,
      errors,
    });
  } catch (error) {
    next(error);
  }
};

const findMidMonthPayrollProcessing = async (req, res, next) => {
  try {
    const reqData =
      await midmonthPayrollProcessingService.findMidMonthPayrollProcessingById(
        req.params.id
      );

    if (!reqData)
      throw new CustomError("MidMonth Payroll Processing not found", 404);

    res
      .status(200)
      .success("MidMonth Payroll Processing fetched successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const updateMidMonthPayrollProcessing = async (req, res, next) => {
  console.log(" Controller hit: GET /midmonth-payroll-processing/:id");

  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData =
      await midmonthPayrollProcessingService.updateMidMonthPayrollProcessing(
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

const deleteMidMonthPayrollProcessing = async (req, res, next) => {
  try {
    await midmonthPayrollProcessingService.deleteMidMonthPayrollProcessing(
      req.params.id
    );
    res
      .status(200)
      .success("MidMonth Payroll Processing deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllMidMonthPayrollProcessing = async (req, res, next) => {
  try {
    const {
      search,
      page,
      size,
      startDate,
      endDate,
      payroll_month,
      payroll_year,
    } = req.query;

    const data =
      await midmonthPayrollProcessingService.getAllMidMonthPayrollProcessing(
        search,
        page,
        size,
        startDate,
        endDate,
        payroll_month,
        payroll_year
      );

    res.status(200).json({
      success: true,
      data,
      message: "Success",
      status: 200,
    });
  } catch (error) {
    next(error);
  }
};

const triggerMidMonthPostingSP = async (req, res, next) => {
  try {
    const result = await midmonthPayrollProcessingService.callMidMonthPostingSP(
      req.body
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createMidMonthPayrollProcessing,
  updateMidMonthPayrollProcessing,
  deleteMidMonthPayrollProcessing,
  getAllMidMonthPayrollProcessing,
  findMidMonthPayrollProcessing,
  triggerMidMonthPostingSP,
};
