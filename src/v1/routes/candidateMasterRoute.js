const express = require("express");
const candidateMasterController = require("../controller/candidateMasterController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/UploadFileMiddleware.js");

const router = express.Router();

router.post(
  "/candidate-master",
  authenticateToken,
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
  candidateMasterController.updateCandidateMaster
);

router.delete(
  "/candidate-master/:id",
  authenticateToken,
  candidateMasterController.deleteCandidateMaster
);

router.delete(
  "/candidate-master",
  authenticateToken,
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
  candidateMasterController.updateCandidateMasterStatus
);

module.exports = router;
