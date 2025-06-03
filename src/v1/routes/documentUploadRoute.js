// const express = require("express");
// const router = express.Router();
// const documentUploadController = require("../controller/documentUploadController.js");
// const { authenticateToken } = require("../middlewares/authMiddleware.js");

// // Create document upload routes
// router.post(
//   "/document-upload",
//   authenticateToken,
//   documentUploadController.createDocument
// );

// // Get all document uploads routes
// router.get(
//   "/document-upload",
//   authenticateToken,
//   documentUploadController.getAllDocuments
// );

// // Get a single document upload by ID routes
// router.get(
//   "/document-upload/:id",
//   authenticateToken,
//   documentUploadController.getDocumentById
// );

// // Update a document upload by ID routes
// router.put(
//   "/document-upload/:id",
//   authenticateToken,
//   documentUploadController.updateDocument
// );

// // Delete  document upload by ID routes
// router.delete(
//   "/document-upload/:id",
//   authenticateToken,
//   documentUploadController.deleteDocument
// );

// module.exports = router;

const express = require("express");
const router = express.Router();
const documentUploadController = require("../controller/documentUploadController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/UploadFileMiddleware"); // Your multer middleware

// Create document upload routes (file upload here)
router.post(
  "/document-upload",
  authenticateToken,
  upload.single("file"), // Add multer here for file upload
  documentUploadController.createDocument
);

// Get all document uploads routes (no file upload, no multer)
router.get(
  "/document-upload",
  authenticateToken,
  documentUploadController.getAllDocuments
);

// Get a single document upload by ID routes (no file upload)
router.get(
  "/document-upload/:id",
  authenticateToken,
  documentUploadController.getDocumentById
);

// Update a document upload by ID routes (file upload possible here)
router.put(
  "/document-upload/:id",
  authenticateToken,
  upload.single("file"), // Add multer here for possible file upload
  documentUploadController.updateDocument
);

// Delete document upload by ID routes (no file upload)
router.delete(
  "/document-upload/:id",
  authenticateToken,
  documentUploadController.deleteDocument
);

module.exports = router;
