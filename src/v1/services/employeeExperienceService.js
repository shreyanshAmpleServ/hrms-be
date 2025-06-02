const employeeExperienceModel = require("../models/employeeExperienceModel.js");

const createEmployeeExperience = async (data) => {
  return await employeeExperienceModel.createEmployeeExperience(data);
};

const findEmployeeExperienceById = async (id) => {
  return await employeeExperienceModel.findEmployeeExperienceById(id);
};

const updateEmployeeExperience = async (id, data) => {
  return await employeeExperienceModel.updateEmployeeExperience(id, data);
};

const deleteEmployeeExperience = async (id) => {
  return await employeeExperienceModel.deleteEmployeeExperience(id);
};

const getAllEmployeeExperience = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await employeeExperienceModel.getAllEmployeeExperience(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createEmployeeExperience,
  findEmployeeExperienceById,
  updateEmployeeExperience,
  deleteEmployeeExperience,
  getAllEmployeeExperience,
};
