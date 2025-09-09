const express = require("express");
const JobPostingController = require("../controller/JobPostingController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/job-posting",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Job Posting", "create"),
  JobPostingController.createJobPosting
);
router.get(
  "/job-posting/:id",
  authenticateToken,
  JobPostingController.findJobPostingById
);
router.put(
  "/job-posting/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Job Posting", "update"),
  JobPostingController.updateJobPosting
);
router.delete(
  "/job-posting/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Job Posting", "delete"),
  JobPostingController.deleteJobPosting
);
router.get(
  "/job-posting",
  authenticateToken,
  JobPostingController.getAllJobPosting
);

module.exports = router;
