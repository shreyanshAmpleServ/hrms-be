const travelExpenseService = require("../services/travelExpenseService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createTravelExpense = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await travelExpenseService.createTravelExpense(data);
    res.status(201).success("Travel expense created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findTravelExpense = async (req, res, next) => {
  try {
    const reqData = await travelExpenseService.findTravelExpenseById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Travel expense not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateTravelExpense = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await travelExpenseService.updateTravelExpense(
      req.params.id,
      data
    );
    res.status(200).success("Travel expense updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteTravelExpense = async (req, res, next) => {
  try {
    await travelExpenseService.deleteTravelExpense(req.params.id);
    res.status(200).success("Travel expense deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllTravelExpenses = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await travelExpenseService.getAllTravelExpense(
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
  createTravelExpense,
  findTravelExpense,
  updateTravelExpense,
  deleteTravelExpense,
  getAllTravelExpenses,
};
