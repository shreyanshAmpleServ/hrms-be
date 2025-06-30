const designationModel = require("../models/designationModel");

const createDesignation = async (data) => {
  return await designationModel.createDesignation(data);
};

const findDesignationById = async (id) => {
  return await designationModel.findDesignationById(id);
};

const updateDesignation = async (id, data) => {
  return await designationModel.updateDesignation(id, data);
};

const deleteDesignation = async (id) => {
  return await designationModel.deleteDesignation(id);
};

const getAllDesignation = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await designationModel.getAllDesignation(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createDesignation,
  findDesignationById,
  updateDesignation,
  deleteDesignation,
  getAllDesignation,
};
