const grievanceModel = require("../models/grievanceModel");

const createGrievanceSubmission = async (data) => {
  return await grievanceModel.createGrievanceSubmission(data);
};

const findGrievanceSubmissionById = async (id) => {
  return await grievanceModel.findGrievanceSubmissionById(id);
};

const updateGrievanceSubmission = async (id, data) => {
  return await grievanceModel.updateGrievanceSubmission(id, data);
};

const deleteGrievanceSubmission = async (id) => {
  return await grievanceModel.deleteGrievanceSubmission(id);
};

const getAllGrievanceSubmission = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await grievanceModel.getAllGrievanceSubmission(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

const updateGrievanceSubmissionStatus = async (id, data) => {
  return await grievanceModel.updateGrievanceSubmissionStatus(id, data);
};
module.exports = {
  createGrievanceSubmission,
  findGrievanceSubmissionById,
  updateGrievanceSubmission,
  deleteGrievanceSubmission,
  getAllGrievanceSubmission,
  updateGrievanceSubmissionStatus,
};
