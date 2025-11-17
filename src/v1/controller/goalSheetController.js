const goalSheetService = require("../services/goalSheetService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createGoalSheet = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await goalSheetService.createGoalSheet(data);
    res.status(201).success("Goal sheet created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findGoalSheet = async (req, res, next) => {
  try {
    const reqData = await goalSheetService.findGoalSheetById(req.params.id);
    if (!reqData) throw new CustomError("Goal sheet not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateGoalSheet = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await goalSheetService.updateGoalSheet(req.params.id, data);
    res.status(200).success("Goal sheet updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteGoalSheet = async (req, res, next) => {
  try {
    await goalSheetService.deleteGoalSheet(req.params.id);
    res.status(200).success("Goal sheet deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllGoalSheet = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await goalSheetService.getAllGoalSheet(
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

const updateGoalSheetStatus = async (req, res, next) => {
  try {
    console.log("Approver ID from token:", req.user.employee_id);
    const status = req.body.status;

    const data = {
      status,
      updatedby: req.user.employee_id,
      updatedate: new Date(),
    };

    const reqData = await goalSheetService.updateGoalSheetStatus(
      req.params.id,
      data
    );
    res.status(200).success("Goal sheet status updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createGoalSheet,
  findGoalSheet,
  updateGoalSheet,
  deleteGoalSheet,
  getAllGoalSheet,
  updateGoalSheetStatus,
};
