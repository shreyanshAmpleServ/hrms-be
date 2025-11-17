const assetAssignmentModel = require("../models/assetAassignmentModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createAssetAssignment = async (data) => {
  return await assetAssignmentModel.createAssetAssignment(data);
};

const findAssetAssignmentById = async (id) => {
  return await assetAssignmentModel.findAssetAssignmentById(id);
};

const updateAssetAssignment = async (id, data) => {
  return await assetAssignmentModel.updateAssetAssignment(id, data);
};

const deleteAssetAssignment = async (id) => {
  return await assetAssignmentModel.deleteAssetAssignment(id);
};

const getAllAssetAssignment = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await assetAssignmentModel.getAllAssetAssignments(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createAssetAssignment,
  findAssetAssignmentById,
  updateAssetAssignment,
  deleteAssetAssignment,
  getAllAssetAssignment,
};
