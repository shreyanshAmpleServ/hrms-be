// const express = require("express");
// const router = express.Router();
// const { authenticateToken } = require("../middlewares/authMiddleware.js");
// const candidateDocumentController = require("../controller/candidateDocumentController.js");
// const upload = require("../middlewares/UploadFileMiddleware.js");

// router.post(
//   "/candidate-document",
//   upload.fields([{ name: "candidate_document", maxCount: 1 }]),
//   authenticateToken,
//   candidateDocumentController.createCandidateDocument
// );

// router.get(
//   "/candidate-document",
//   authenticateToken,
//   candidateDocumentController.getAllCandidateDocument
// );

// router.put(
//   "/candidate-document/:id",
//   upload.fields([{ name: "candidate_document", maxCount: 1 }]),
//   authenticateToken,
//   candidateDocumentController.updateCandidateDocument
// );

// router.get(
//   "/candidate-document/:id",
//   authenticateToken,
//   candidateDocumentController.findCandidateDocument
// );

// router.delete(
//   "/candidate-document/:id",
//   authenticateToken,
//   candidateDocumentController.deleteCandidateDocument
// );

// module.exports = router;

const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const candidateDocumentController = require("../controller/candidateDocumentController.js");
const upload = require("../middlewares/UploadFileMiddleware.js");

router.post(
  "/candidate-document",
  upload.fields([{ name: "candidate_document", maxCount: 10 }]),
  authenticateToken,
  candidateDocumentController.createCandidateDocument
);

router.get(
  "/candidate-document",
  authenticateToken,
  candidateDocumentController.getAllCandidateDocument
);

router.get(
  "/candidate-document/candidate/:candidateId",
  authenticateToken,
  candidateDocumentController.findCandidateDocumentsByCandidate
);

router.get(
  "/candidate-document/:id",
  authenticateToken,
  candidateDocumentController.findCandidateDocument
);

router.put(
  "/candidate-document/:id",
  upload.fields([{ name: "candidate_document", maxCount: 1 }]),
  authenticateToken,
  candidateDocumentController.updateCandidateDocument
);

router.delete(
  "/candidate-document/:id",
  authenticateToken,
  candidateDocumentController.deleteCandidateDocument
);

router.post(
  "/candidate-document/bulk-delete",
  authenticateToken,
  candidateDocumentController.deleteMultipleCandidateDocuments
);

module.exports = router;
