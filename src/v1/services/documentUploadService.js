const documentUploadModel = require("../models/documentUploadModel.js");

const createDocument = async (data) => {
  return await documentUploadModel.createDocumentUpload(data);
};

const getDocumentById = async (id) => {
  return await documentUploadModel.getDocumentById(id);
};

const updateDocument = async (id, data) => {
  return await documentUploadModel.updateDocumentUpload(id, data);
};

const deleteDocument = async (id) => {
  return await documentUploadModel.deleteDocumentUpload(id);
};

const getAllDocuments = async (
  search,
  page,
  size,
  startDate,
  endDate,
  employeeId
) => {
  return await documentUploadModel.getAllDocumentUpload(
    search,
    page,
    size,
    startDate,
    endDate,
    employeeId
  );
};

module.exports = {
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getAllDocuments,
};
