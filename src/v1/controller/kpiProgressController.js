const kpiProgressService = require("../services/kpiProgressService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createKpiProgress = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await kpiProgressService.createKpiProgress(data);
    res.status(201).success("KPI progress created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findKpiProgress = async (req, res, next) => {
  try {
    const reqData = await kpiProgressService.findKpiProgressById(req.params.id);
    if (!reqData) throw new CustomError("KPI progress not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateKpiProgress = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await kpiProgressService.updateKpiProgress(
      req.params.id,
      data
    );
    res.status(200).success("KPI progress updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteKpiProgress = async (req, res, next) => {
  try {
    await kpiProgressService.deleteKpiProgress(req.params.id);
    res.status(200).success("KPI progress deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllKpiProgress = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await kpiProgressService.getAllKpiProgress(
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
  createKpiProgress,
  findKpiProgress,
  updateKpiProgress,
  deleteKpiProgress,
  getAllKpiProgress,
};
