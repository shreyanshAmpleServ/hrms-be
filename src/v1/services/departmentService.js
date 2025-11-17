const departmentModel = require("../models/departmentModel");
const { getPrisma } = require("../../config/prismaContext.js");

const createDepartment = async (data) => {
  return await departmentModel.createDepartment(data);
};

const findDepartmentById = async (id) => {
  return await departmentModel.findDepartmentById(id);
};

const updateDepartment = async (id, data) => {
  return await departmentModel.updateDepartment(id, data);
};

const deleteDepartment = async (id) => {
  return await departmentModel.deleteDepartment(id);
};

const getAllDepartments = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await departmentModel.getAllDepartments(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

const getDepartmentOptions = async (is_active) => {
  return await departmentModel.getDepartmentOptions(is_active);
};
module.exports = {
  createDepartment,
  findDepartmentById,
  updateDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentOptions,
};
