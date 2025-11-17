const grievanceTypeModel = require('../models/grievanceTypeModel');
const { getPrisma } = require("../../config/prismaContext.js");

const createGrievanceType = async (data) => {
  return await grievanceTypeModel.createGrievanceType(data);
};

const findGrievanceTypeById = async (id) => {
  return await grievanceTypeModel.findGrievanceTypeById(id);
};

const updateGrievanceType = async (id, data) => {
  return await grievanceTypeModel.updateGrievanceType(id, data);
};

const deleteGrievanceType = async (id) => {
  return await grievanceTypeModel.deleteGrievanceType(id);
};

const getAllGrievanceType = async (page, size, search,  startDate,endDate) => {
  return await grievanceTypeModel.getAllGrievanceType(page, size, search,  startDate,endDate);
};

module.exports = {
  createGrievanceType,
  findGrievanceTypeById,
  updateGrievanceType,
  deleteGrievanceType,
  getAllGrievanceType,
};
