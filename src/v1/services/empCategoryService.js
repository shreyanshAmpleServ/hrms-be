const empCategoryModel = require("../models/empCategoryModel");

const createEmpCategory = async (data) => {
  return await empCategoryModel.createEmpCategory(data);
};

const findEmpCategoryById = async (id) => {
  return await empCategoryModel.findEmpCategoryById(id);
};

const updateEmpCategory = async (id, data) => {
  return await empCategoryModel.updateEmpCategory(id, data);
};

const deleteEmpCategory = async (id) => {
  return await empCategoryModel.deleteEmpCategory(id);
};

const getAllEmpCategory = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await empCategoryModel.getAllEmpCategory(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createEmpCategory,
  findEmpCategoryById,
  updateEmpCategory,
  deleteEmpCategory,
  getAllEmpCategory,
};
