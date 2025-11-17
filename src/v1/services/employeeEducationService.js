const employeeEducationModel = require("../models/employeeEducationModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createEmployeeEducation = async (data) => {
  return await employeeEducationModel.createEmployeeEducation(data);
};

const findEmployeeEducationById = async (id) => {
  return await employeeEducationModel.findEmployeeEducationById(id);
};

const updateEmployeeEducation = async (id, data) => {
  return await employeeEducationModel.updateEmployeeEducation(id, data);
};

const deleteEmployeeEducation = async (id) => {
  return await employeeEducationModel.deleteEmployeeEducation(id);
};

const getAllEmployeeEducation = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await employeeEducationModel.getAllEmployeeEducation(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createEmployeeEducation,
  findEmployeeEducationById,
  updateEmployeeEducation,
  deleteEmployeeEducation,
  getAllEmployeeEducation,
};
