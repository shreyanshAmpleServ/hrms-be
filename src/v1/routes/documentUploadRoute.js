const express = require("express");
const router = express.Router();
const documentUploadController = require("../controller/probationReviewController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create document upload routes
router.post(
  "/document-upload",
  authenticateToken,
  documentUploadController.uploadDocument
);

// Get all document uploads routes
router.get(
  "/document-upload",
  authenticateToken,
  documentUploadController.getAllDocumentUploads
);

// Get a single document upload by ID routes
router.get(
  "/document-upload/:id",
  authenticateToken,
  documentUploadController.findDocumentUpload
);

// Update a document upload by ID routes
router.put(
  "/document-upload/:id",
  authenticateToken,
  documentUploadController.updateDocumentUpload
);

// Delete  document upload by ID routes
router.delete(
  "/document-upload/:id",
  authenticateToken,
  documentUploadController.deleteDocumentUpload
);

module.exports = router;
