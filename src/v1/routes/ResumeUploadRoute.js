const express = require("express");
const ResumeUploadController = require("../controller/ResumeUploadController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/UploadFileMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/resume-upload",
  authenticateToken,
  upload.single("resume_path"),
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Resume Upload", "create"),
  ResumeUploadController.createResumeUpload
);
router.get(
  "/resume-upload/:id",
  authenticateToken,
  ResumeUploadController.findResumeUploadById
);
router.put(
  "/resume-upload/:id",
  authenticateToken,
  upload.single("resume_path"),
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Resume Upload", "update"),
  ResumeUploadController.updateResumeUpload
);
router.delete(
  "/resume-upload/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Resume Upload", "delete"),
  ResumeUploadController.deleteResumeUpload
);
router.get(
  "/resume-upload",
  authenticateToken,
  ResumeUploadController.getAllResumeUpload
);

module.exports = router;
