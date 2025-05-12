const jobCategoryModel = require('../models/jobCategoryModel');

const createJobCategory = async (data) => {
  return await jobCategoryModel.createJobCategory(data);
};

const findJobCategoryById = async (id) => {
  return await jobCategoryModel.findJobCategoryById(id);
};

const updateJobCategory = async (id, data) => {
  return await jobCategoryModel.updateJobCategory(id, data);
};

const deleteJobCategory = async (id) => {
  return await jobCategoryModel.deleteJobCategory(id);
};

const getAllJobCategory = async (page, size, search,  startDate,endDate) => {
  return await jobCategoryModel.getAllJobCategory(page, size, search,  startDate,endDate);
};

module.exports = {
  createJobCategory,
  findJobCategoryById,
  updateJobCategory,
  deleteJobCategory,
  getAllJobCategory,
};