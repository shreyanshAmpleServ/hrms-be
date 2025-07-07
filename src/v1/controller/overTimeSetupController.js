const overTimeSetupService = require("../services/overTimeSetupService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createOverTimeSetup = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await overTimeSetupService.createOverTimeSetup(data);
    res.status(201).success("OverTime Setup created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findOverTimeSetup = async (req, res, next) => {
  try {
    const reqData = await overTimeSetupService.findOverTimeSetupById(
      req.params.id
    );
    if (!reqData) throw new CustomError("OverTime Setup not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateOverTimeSetup = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await overTimeSetupService.updateOverTimeSetup(
      req.params.id,
      data
    );
    res.status(200).success("OverTime Setup updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteOverTimeSetup = async (req, res, next) => {
  try {
    await overTimeSetupService.deleteOverTimeSetup(req.params.id);
    res.status(200).success("OverTime Setup  deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllOverTimeSetup = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await loanMasterService.getAllOverTimeSetup(
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
  createOverTimeSetup,
  updateOverTimeSetup,
  findOverTimeSetup,
  deleteOverTimeSetup,
  getAllOverTimeSetup,
};
