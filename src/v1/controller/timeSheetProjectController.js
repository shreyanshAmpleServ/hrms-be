const timeSheetProjectService = require("../services/timeSheetProjectService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createTimeSheetProject = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await timeSheetProjectService.createTimeSheetProject(data);
    res.status(201).success("Time sheet project created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findTimeSheetProject = async (req, res, next) => {
  try {
    const reqData = await timeSheetProjectService.findTimeSheetProjectById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Time sheet project not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateTimeSheetProject = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await timeSheetProjectService.updateTimeSheetProject(
      req.params.id,
      data
    );
    res.status(200).success("Time sheet project updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteTimeSheetProject = async (req, res, next) => {
  try {
    await timeSheetProjectService.deleteTimeSheetProject(req.params.id);
    res.status(200).success("Time sheet project deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllTimeSheetProject = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await timeSheetProjectService.getAllTimeSheetProject(
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
  createTimeSheetProject,
  findTimeSheetProject,
  updateTimeSheetProject,
  deleteTimeSheetProject,
  getAllTimeSheetProject,
};
