const employeeEducationService = require("../services/employeeEducationService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createEmployeeEducation = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await employeeEducationService.createEmployeeEducation(
      data
    );
    res.status(201).success("Employee education created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findEmployeeEducation = async (req, res, next) => {
  try {
    const reqData = await employeeEducationService.findEmployeeEducationById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Employee education not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateEmployeeEducation = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await employeeEducationService.updateEmployeeEducation(
      req.params.id,
      data
    );
    res.status(200).success("Employee education updated successfully", reqData);
    console.log("Updating with:", data.updatedby, new Date());
  } catch (error) {
    next(error);
  }
};

const deleteEmployeeEducation = async (req, res, next) => {
  try {
    await employeeEducationService.deleteEmployeeEducation(req.params.id);
    res.status(200).success("Employee education deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllEmployeeEducation = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await employeeEducationService.getAllEmployeeEducation(
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
  createEmployeeEducation,
  findEmployeeEducation,
  updateEmployeeEducation,
  deleteEmployeeEducation,
  getAllEmployeeEducation,
};
