const costCenterService = require("../services/costCenterService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createCostCenter = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);
    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await costCenterService.createCostCenter(data);
    res.status(201).success("Cost Center created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findCostCenter = async (req, res, next) => {
  try {
    const reqData = await costCenterService.findCostCenterById(req.params.id);
    if (!reqData) throw new CustomError("Cost Center not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateCostCenter = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await costCenterService.updateCostCenter(
      req.params.id,
      data
    );
    res.status(200).success("Cost Center updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteCostCenter = async (req, res, next) => {
  try {
    await costCenterService.deleteCostCenter(req.params.id);
    res.status(200).success("Cost Center deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllCostCenter = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;

    const data = await costCenterService.getAllCostCenter(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      is_active
    );

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCostCenter,
  findCostCenter,
  updateCostCenter,
  deleteCostCenter,
  getAllCostCenter,
};
