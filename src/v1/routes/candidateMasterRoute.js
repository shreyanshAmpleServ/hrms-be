const express = require("express");
const candidateMasterController = require("../controller/candidateMasterController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/UploadFileMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/candidate-master",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Candidate Master", "create"),
  upload.fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "resume_path", maxCount: 1 },
  ]),
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
  upload.fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "resume_path", maxCount: 1 },
  ]),
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Candidate Master", "update"),
  candidateMasterController.updateCandidateMaster
);

router.delete(
  "/candidate-master/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Candidate Master", "delete"),
  candidateMasterController.deleteCandidateMaster
);

router.delete(
  "/candidate-master",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Candidate Master", "delete"),
  candidateMasterController.deleteCandidateMaster
);

router.get(
  "/candidate-master",
  authenticateToken,
  candidateMasterController.getAllCandidateMaster
);

router.patch(
  "/candidate-master/:id/status",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Candidate Master", "update"),
  candidateMasterController.updateCandidateMasterStatus
);

router.post(
  "/candidate-master/:id/create-employee",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Candidate Master", "update"),
  candidateMasterController.createEmployeeFromCandidate
);

module.exports = router;
