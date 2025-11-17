// const candidateDocumentService = require("../services/candidateDocumentService.js");
// const CustomError = require("../../utils/CustomError");
// const moment = require("moment");
// const fs = require("fs");
// const {
//   uploadToBackblaze,
//   deleteFromBackblaze,
// } = require("../../utils/uploadBackblaze.js");

// const createCandidateDocument = async (req, res, next) => {
//   try {
//     let candidateDocument = null;

//     console.log(
//       "candidate_document file buffer",
//       req.files?.candidate_document?.[0]?.buffer
//     );

//     if (req.files?.candidate_document) {
//       const file = req.files.candidate_document[0];
//       const buffer = file.buffer;
//       candidateDocument = await uploadToBackblaze(
//         buffer,
//         file.originalname,
//         file.mimetype,
//         "candidate_document"
//       );
//     }
//     const data = {
//       ...req.body,
//       candidate_document: candidateDocument,
//       createdby: req.user.id,
//       log_inst: req.user.log_inst,
//     };
//     const reqData = await candidateDocumentService.createCandidateDocument(
//       data
//     );
//     res.status(201).success("Candidate Document created successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// const findCandidateDocument = async (req, res, next) => {
//   try {
//     const reqData = await candidateDocumentService.findCandidateDocument(
//       req.params.id
//     );
//     if (!reqData) throw new CustomError("Candidate Document not found", 404);
//     res.status(200).success(null, reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// const updateCandidateDocument = async (req, res, next) => {
//   try {
//     const existingData = await candidateDocumentService.findCandidateDocument(
//       req.params.id
//     );
//     let candidateDocument = existingData.candidate_document;
//     if (req.files?.candidate_document) {
//       const file = req.files.candidate_document[0];
//       const buffer = file.buffer;
//       candidateDocument = await uploadToBackblaze(
//         buffer,
//         file.originalname,
//         file.mimetype,
//         "candidate_document"
//       );
//       if (existingData.candidate_document) {
//         await deleteFromBackblaze(existingData.candidate_document);
//       }
//     }
//     const data = {
//       ...req.body,
//       candidate_document: candidateDocument,
//       updatedby: req.user.id,
//       log_inst: req.user.log_inst,
//     };
//     const reqData = await candidateDocumentService.updateCandidateDocument(
//       req.params.id,
//       data
//     );
//     res.status(200).success("Candidate Document updated successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// const deleteCandidateDocument = async (req, res, next) => {
//   try {
//     const reqData = await candidateDocumentService.deleteCandidateDocument(
//       req.params.id
//     );
//     if (!reqData) throw new CustomError("Candidate Document not found", 404);
//     res.status(200).success("Candidate Document deleted successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// const getAllCandidateDocument = async (req, res, next) => {
//   try {
//     const { page, size, search, startDate, endDate } = req.query;
//     const data = await candidateDocumentService.getAllCandidateDocument(
//       search,
//       Number(page),
//       Number(size),
//       startDate && moment(startDate),
//       endDate && moment(endDate)
//     );
//     res.status(200).success(null, data);
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   createCandidateDocument,
//   findCandidateDocument,
//   updateCandidateDocument,
//   deleteCandidateDocument,
//   getAllCandidateDocument,
// };

const candidateDocumentService = require("../services/candidateDocumentService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze.js");

// Create candidate document with single or multiple file upload
const createCandidateDocument = async (req, res, next) => {
  try {
    if (
      !req.files?.candidate_document ||
      req.files.candidate_document.length === 0
    ) {
      throw new CustomError("No files uploaded", 400);
    }

    const files = req.files.candidate_document;
    const uploadedPaths = [];

    // Upload all files to Backblaze
    for (const file of files) {
      const buffer = file.buffer;
      const filePath = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "candidate_document"
      );
      uploadedPaths.push(filePath);
    }

    // Create document records for each uploaded file
    const documentsToCreate = uploadedPaths.map((path, index) => ({
      candidate_id: Number(req.body.candidate_id),
      path,
      name: files[index].originalname,
      type_id: req.body.type_id ? Number(req.body.type_id) : null,
      expiry_date: req.body.expiry_date || null,
      status: req.body.status || "Active",
      remarks: req.body.remarks || null,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    }));

    let reqData;
    if (documentsToCreate.length === 1) {
      reqData = await candidateDocumentService.createCandidateDocument(
        documentsToCreate[0]
      );
    } else {
      reqData = await candidateDocumentService.createMultipleCandidateDocuments(
        documentsToCreate
      );
    }

    res
      .status(201)
      .success(
        `${documentsToCreate.length} Document(s) created successfully`,
        reqData
      );
  } catch (error) {
    next(error);
  }
};

// Find single candidate document
const findCandidateDocument = async (req, res, next) => {
  try {
    const reqData = await candidateDocumentService.findCandidateDocument(
      req.params.id
    );
    if (!reqData) throw new CustomError("Candidate document not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

// Find all documents for a candidate
const findCandidateDocumentsByCandidate = async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const reqData =
      await candidateDocumentService.findCandidateDocumentsByCandidate(
        candidateId
      );
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

// Update candidate document
const updateCandidateDocument = async (req, res, next) => {
  try {
    const existingData = await candidateDocumentService.findCandidateDocument(
      req.params.id
    );

    let documentPath = existingData.path;

    // If new file is uploaded, replace the old one
    if (req.files?.candidate_document) {
      const file = req.files.candidate_document[0];
      const buffer = file.buffer;

      documentPath = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "candidate_document"
      );

      // Delete old file from Backblaze
      if (existingData.path) {
        await deleteFromBackblaze(existingData.path);
      }
    }

    const data = {
      candidate_id: req.body.candidate_id || existingData.candidate_id,
      path: documentPath,
      name: req.files?.candidate_document
        ? req.files.candidate_document[0].originalname
        : existingData.name,
      type_id: req.body.type_id || existingData.type_id,
      expiry_date: req.body.expiry_date || existingData.expiry_date,
      status: req.body.status || existingData.status,
      remarks: req.body.remarks || existingData.remarks,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };

    const reqData = await candidateDocumentService.updateCandidateDocument(
      req.params.id,
      data
    );

    res.status(200).success("Candidate document updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

// Delete single candidate document
const deleteCandidateDocument = async (req, res, next) => {
  try {
    const existingData = await candidateDocumentService.findCandidateDocument(
      req.params.id
    );

    // Delete file from Backblaze
    if (existingData.path) {
      await deleteFromBackblaze(existingData.path);
    }

    const reqData = await candidateDocumentService.deleteCandidateDocument(
      req.params.id
    );
    if (!reqData) throw new CustomError("Candidate document not found", 404);

    res.status(200).success("Candidate document deleted successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteMultipleCandidateDocuments = async (req, res, next) => {
  try {
    const { documentIds } = req.body;

    if (
      !documentIds ||
      !Array.isArray(documentIds) ||
      documentIds.length === 0
    ) {
      throw new CustomError(
        "documentIds array is required and cannot be empty",
        400
      );
    }

    // Get all documents to delete their files before deletion
    const documents = [];
    for (const id of documentIds) {
      try {
        const doc = await candidateDocumentService.findCandidateDocument(id);
        if (doc && doc.path) {
          documents.push(doc);
        }
      } catch (error) {
        // Document might not exist, continue with others
        console.log(`Document ${id} not found, skipping file deletion`);
      }
    }

    // Delete files from Backblaze
    for (const doc of documents) {
      if (doc.path) {
        await deleteFromBackblaze(doc.path);
      }
    }

    const result =
      await candidateDocumentService.deleteMultipleCandidateDocuments(
        documentIds
      );

    res
      .status(200)
      .success(`${result.count} document(s) deleted successfully`, result);
  } catch (error) {
    next(error);
  }
};

const getAllCandidateDocument = async (req, res, next) => {
  try {
    const {
      page = 1,
      size = 10,
      search,
      startDate,
      endDate,
      candidateId,
      typeId,
      status,
    } = req.query;

    const data = await candidateDocumentService.getAllCandidateDocument(
      search,
      Number(page),
      Number(size),
      startDate ? moment(startDate) : undefined,
      endDate ? moment(endDate) : undefined,
      candidateId,
      typeId,
      status
    );

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCandidateDocument,
  findCandidateDocument,
  findCandidateDocumentsByCandidate,
  updateCandidateDocument,
  deleteCandidateDocument,
  deleteMultipleCandidateDocuments,
  getAllCandidateDocument,
};
