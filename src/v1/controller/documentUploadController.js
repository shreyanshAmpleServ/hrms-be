const documentUploadService = require("../services/documentUploadService.js");
const CustomError = require("../../utils/CustomError");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze.js");

const createDocument = async (req, res, next) => {
  try {
    const employeeId = req.body.employee_id
      ? Number(req.body.employee_id)
      : null;

    if (!req.file) throw new CustomError("No file uploaded", 400);

    const fileUrl = await uploadToBackblaze(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "documents"
    );

    const documentData = {
      ...req.body,
      document_path: fileUrl,
      document_owner_id: employeeId,
      uploaded_by: req.user.id,
    };

    const doc = await documentUploadService.createDocument(documentData);
    res.status(201).success("Document uploaded successfully", doc);
  } catch (error) {
    console.log("Error in createDocument:", error);

    next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const doc = await documentUploadService.getDocumentById(req.params.id);
    if (!doc) throw new CustomError("Document not found", 404);
    res.status(200).success(null, doc);
  } catch (error) {
    next(error);
  }
};

const updateDocument = async (req, res, next) => {
  try {
    const employeeId = req.body.employee_id;

    const existingDoc = await documentUploadService.getDocumentById(
      req.params.id
    );
    if (!existingDoc) throw new CustomError("Document not found", 404);

    let fileUrl = existingDoc.file_url;
    if (req.file) {
      fileUrl = await uploadToBackblaze(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "documents"
      );
    }

    const documentData = {
      ...req.body,
      document_path: fileUrl,
      document_owner_id: employeeId,
      updatedby: req.user.id,
    };

    const doc = await documentUploadService.updateDocument(
      req.params.id,
      documentData
    );
    res.status(200).success("Document updated successfully", doc);

    if (existingDoc.file_url && req.file) {
      await deleteFromBackblaze(existingDoc.file_url);
    }
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const existingDoc = await documentUploadService.getDocumentById(
      req.params.id
    );
    if (!existingDoc) throw new CustomError("Document not found", 404);

    await documentUploadService.deleteDocument(req.params.id);
    res.status(200).success("Document deleted successfully", null);

    if (existingDoc.file_url) {
      await deleteFromBackblaze(existingDoc.file_url);
    }
  } catch (error) {
    next(error);
  }
};

const getAllDocuments = async (req, res, next) => {
  try {
    const { page, size, search } = req.query;
    const docs = await documentUploadService.getAllDocuments(
      Number(page),
      Number(size),
      search
    );
    res.status(200).success(null, docs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getAllDocuments,
};
