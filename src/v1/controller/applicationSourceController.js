const applicationSourceService = require("../services/applicationSourceService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createApplicationSource = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };

    const reqData = await applicationSourceService.createApplicationSource(
      data
    );
    res.status(201).success("Application Source created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findApplicationSourceById = async (req, res, next) => {
  try {
    const reqData = await applicationSourceService.findApplicationSourceById(
      req.params.id
    );

    if (!reqData) throw new CustomError("Application Source not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateApplicationSource = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await applicationSourceService.updateApplicationSource(
      req.params.id,
      data
    );
    res.status(200).success("Application Source updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteApplicationSource = async (req, res, next) => {
  try {
    const reqData = await applicationSourceService.deleteApplicationSource(
      req.params.id
    );
    res.status(200).success("Application Source deleted successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const getAllApplicationSource = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await applicationSourceService.getAllApplicationSource(
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
  createApplicationSource,
  getAllApplicationSource,
  findApplicationSourceById,
  updateApplicationSource,
  deleteApplicationSource,
};
