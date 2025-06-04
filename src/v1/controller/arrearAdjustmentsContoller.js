const arrearAdjustmentsService = require("../services/arrearAdjustmentsService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createArrearAdjustment = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await arrearAdjustmentsService.createArrearAdjustment(data);
    res.status(201).success("Arrear adjustment created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findArrearAdjustment = async (req, res, next) => {
  try {
    const reqData = await arrearAdjustmentsService.findArrearAdjustmentById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Arrear adjustment not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateArrearAdjustment = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await arrearAdjustmentsService.updateArrearAdjustment(
      req.params.id,
      data
    );
    res.status(200).success("Arrear adjustment updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteArrearAdjustment = async (req, res, next) => {
  try {
    await arrearAdjustmentsService.deleteArrearAdjustment(req.params.id);
    res.status(200).success("Arrear adjustment deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllArrearAdjustment = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await arrearAdjustmentsService.getAllArrearAdjustment(
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
  createArrearAdjustment,
  findArrearAdjustment,
  updateArrearAdjustment,
  deleteArrearAdjustment,
  getAllArrearAdjustment,
};
