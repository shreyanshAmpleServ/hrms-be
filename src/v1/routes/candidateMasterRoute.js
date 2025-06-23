const express = require("express");
const candidateMasterController = require("../controller/candidateMasterController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/uploadMiddleware.js");

const router = express.Router();

router.post(
  "/candidate-master",
  authenticateToken,
  upload.single("resume_path"),
  candidateMasterController.createCandidateMaster
);

router.get(
  "/candidate-master/:id",
  authenticateToken,
  candidateMasterController.findCandidateMasterById
);

router.put(
  "/candidate-master/:id",
  authenticateToken,
  upload.single("resume_path"),
  candidateMasterController.updateCandidateMaster
);

router.delete(
  "/candidate-master/:id",
  authenticateToken,
  candidateMasterController.deleteCandidateMaster
);

router.get(
  "/canddidate-master",
  authenticateToken,
  candidateMasterController.getAllCandidateMaster
);

router.patch(
  "/candidate-master/:id/status",
  authenticateToken,
  candidateMasterController.updateCandidateMasterStatus
);
