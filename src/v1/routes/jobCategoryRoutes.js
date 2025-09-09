// Country Routes
const express = require("express");
const jobCategoryController = require("../controller/jobCategoryController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/job-category",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Job Category Master",
      "create"
    ),
  jobCategoryController.createJobCategory
);
router.get(
  "/job-category/:id",
  authenticateToken,
  jobCategoryController.findJobCategoryById
);
router.put(
  "/job-category/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Job Category Master",
      "update"
    ),
  jobCategoryController.updateJobCategory
);
router.delete(
  "/job-category/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Job Category Master",
      "delete"
    ),
  jobCategoryController.deleteJobCategory
);
router.get(
  "/job-category",
  authenticateToken,
  jobCategoryController.getAllJobCategory
);

module.exports = router;
