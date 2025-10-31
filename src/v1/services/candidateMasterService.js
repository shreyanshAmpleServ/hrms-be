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

// const deleteCandidateMaster = async (id) => {
//   return await candidateMasterModel.deleteCandidateMaster(id);
// };

const deleteCandidateMaster = async (ids) => {
  return await candidateMasterModel.deleteCandidateMaster(ids);
};

const getRequiredDocumentsForJobPosting = async (jobPostingId) => {
  return await candidateMasterModel.getRequiredDocumentsForJobPosting(
    jobPostingId
  );
};

const createEmployeeFromCandidate = async (
  candidateId,
  additionalData,
  createdBy,
  logInst
) => {
  return await candidateMasterModel.createEmployeeFromCandidate(
    candidateId,
    additionalData,
    createdBy,
    logInst
  );
};

const getAllCandidateMaster = async (
  search,
  page,
  size,
  startDate,
  endDate,
  status
) => {
  return await candidateMasterModel.getAllCandidateMaster(
    search,
    page,
    size,
    startDate,
    endDate,
    status
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
  createEmployeeFromCandidate,
  getRequiredDocumentsForJobPosting,
};
