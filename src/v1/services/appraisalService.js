const appraisalModel = require("../models/AppraisalModel");

const createAppraisalEntry = async (data) => {
  return await appraisalModel.createAppraisalEntry(data);
};

const findAppraisalEntryById = async (id) => {
  return await appraisalModel.findAppraisalEntryById(id);
};

const updateAppraisalEntry = async (id, data) => {
  return await appraisalModel.updateAppraisalEntry(id, data);
};

const deleteAppraisalEntry = async (id) => {
  return await appraisalModel.deleteAppraisalEntry(id);
};

const getAllAppraisalEntry = async (search, page, size, startDate, endDate) => {
  return await appraisalModel.getAllAppraisalEntry(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

const getAppraisalForPDF = async (id) => {
  return await appraisalModel.getAppraisalForPDF(id);
};

const updateAppraisalStatus = async (id, data) => {
  return await appraisalModel.updateAppraisalEntry(id, data);
};

const getAllAppraisalsForBulkDownload = async (
  filters,
  advancedFilters,
  jobId
) => {
  return await appraisalModel.getAllAppraisalsForBulkDownload(
    filters,
    advancedFilters,
    jobId
  );
};

module.exports = {
  createAppraisalEntry,
  findAppraisalEntryById,
  updateAppraisalEntry,
  deleteAppraisalEntry,
  getAllAppraisalEntry,
  getAppraisalForPDF,
  updateAppraisalStatus,
  getAllAppraisalsForBulkDownload,
};
