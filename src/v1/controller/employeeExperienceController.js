const employeeExperienceService = require("../services/employeeExperienceService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createEmployeeExperience = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      experiance_of_employee: req.body.experiance_of_employee,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await employeeExperienceService.createEmployeeExperience(
      data
    );
    res
      .status(201)
      .success("Employee experience created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findEmployeeExperience = async (req, res, next) => {
  try {
    const reqData = await employeeExperienceService.findEmployeeExperienceById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Employee experience not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateEmployeeExperience = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await employeeExperienceService.updateEmployeeExperience(
      req.params.id,
      data
    );
    res
      .status(200)
      .success("Employee experience updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteEmployeeExperience = async (req, res, next) => {
  try {
    await employeeExperienceService.deleteEmployeeExperience(req.params.id);
    res.status(200).success("Employee experience deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllEmployeeExperience = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await employeeExperienceService.getAllEmployeeExperience(
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
  createEmployeeExperience,
  findEmployeeExperience,
  updateEmployeeExperience,
  deleteEmployeeExperience,
  getAllEmployeeExperience,
};
