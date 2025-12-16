const express = require("express");
const router = express.Router();
const documentUploadController = require("../controller/documentUploadController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/UploadFileMiddleware");

//Creaet att
router.post(
  "/document-upload",
  authenticateToken,
  upload.single("document_path"),

  documentUploadController.createDocument
);

// Get all atts routes
router.get(
  "/document-upload",
  authenticateToken,
  documentUploadController.getAllDocuments
);

// Get a single att by ID
router.get(
  "/document-upload/:id",
  authenticateToken,
  documentUploadController.getDocumentById
);

// Update a att by ID
router.put(
  "/document-upload/:id",
  authenticateToken,
  upload.single("document_path"),

  documentUploadController.updateDocument
);

// Delete att by ID
router.delete(
  "/document-upload/:id",
  authenticateToken,

  documentUploadController.deleteDocument
);

module.exports = router;
