const express = require("express");
const router = express.Router();
const documentUploadController = require("../controller/documentUploadController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/UploadFileMiddleware"); // Your multer middleware

//Creaet document upload
router.post(
  "/document-upload",
  authenticateToken,
  upload.single("file"),
  documentUploadController.createDocument
);

// Get all document uploads routes
router.get(
  "/document-upload",
  authenticateToken,
  documentUploadController.getAllDocuments
);

// Get a single document upload by ID
router.get(
  "/document-upload/:id",
  authenticateToken,
  documentUploadController.getDocumentById
);

// Update a document upload by ID
router.put(
  "/document-upload/:id",
  authenticateToken,
  upload.single("file"),
  documentUploadController.updateDocument
);

// Delete document upload by ID
router.delete(
  "/document-upload/:id",
  authenticateToken,
  documentUploadController.deleteDocument
);

module.exports = router;
