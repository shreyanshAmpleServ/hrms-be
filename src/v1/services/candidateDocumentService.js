const candidateDocumentModel = require("../models/candidateDocumentModel.js");

const createCandidateDocument = async (data) => {
  return await candidateDocumentModel.createCandidateDocument(data);
};

const findCandidateDocument = async (data) => {
  return await candidateDocumentModel.findCandidateDocument(data);
};

const updateCandidateDocument = async (id, data) => {
  return await candidateDocumentModel.updateCandidateDocument(id, data);
};

const deleteCandidateDocument = async (data) => {
  return await candidateDocumentModel.deleteCandidateDocument(data);
};

const getAllCandidateDocument = async (
  search,
  page,
  size,
  startDate,
  endDate,
  candidateId,
  typeId,
  status
) => {
  return await candidateDocumentModel.getAllCandidateDocument(
    search,
    page,
    size,
    startDate,
    endDate,
    candidateId,
    typeId,
    status
  );
};

const findCandidateDocumentsByCandidate = async (candidateId) => {
  return await candidateDocumentModel.findCandidateDocumentsByCandidate(
    candidateId
  );
};

const deleteMultipleCandidateDocuments = async (data) => {
  return await candidateDocumentModel.deleteMultipleCandidateDocuments(data);
};

const createMultipleCandidateDocuments = async (data) => {
  return await candidateDocumentModel.createMultipleCandidateDocuments(data);
};

module.exports = {
  createCandidateDocument,
  findCandidateDocument,
  updateCandidateDocument,
  deleteCandidateDocument,
  getAllCandidateDocument,
  findCandidateDocumentsByCandidate,
  deleteMultipleCandidateDocuments,
  createMultipleCandidateDocuments,
};
