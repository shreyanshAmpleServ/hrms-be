const candidateMasterModel = require("../models/candidateMasterModel.js");

// Service to create a training session
const createCandidateMaster = async (data) => {
  return await candidateMasterModel.createCandidateMaster(data);
};

// Service to get a training session by ID
const getCandidateMasterById = async (id) => {
  return await candidateMasterModel.findCandidateMasterById(id);
};

const updateCandidateMaster = async (id, data) => {
  return await candidateMasterModel.updateCandidateMaster(id, data);
};

const deleteCandidateMaster = async (id) => {
  return await candidateMasterModel.deleteCandidateMaster(id);
};

const getAllCandidateMaster = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await candidateMasterModel.getAllCandidateMaster(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

const updateCandidateMasterStatus = async (id, data) => {
  return await candidateMasterModel.updateCandidateMasterStatus(id, data);
};

module.exports = {
  createCandidateMaster,
  getCandidateMasterById,
  updateCandidateMaster,
  deleteCandidateMaster,
  updateCandidateMasterStatus,
  getAllCandidateMaster,
};
