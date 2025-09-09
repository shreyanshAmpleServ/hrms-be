const express = require("express");
const grievanceController = require("../controller/grievanceController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/grievance-submission",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Grievance Submission",
      "create"
    ),
  grievanceController.createGrievanceSubmission
);
router.get(
  "/grievance-submission/:id",
  authenticateToken,
  grievanceController.findGrievanceSubmissionById
);
router.put(
  "/grievance-submission/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Grievance Submission",
      "update"
    ),
  grievanceController.updateGrievanceSubmission
);
router.delete(
  "/grievance-submission/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Grievance Submission",
      "delete"
    ),
  grievanceController.deleteGrievanceSubmission
);
router.get(
  "/grievance-submission",
  authenticateToken,
  grievanceController.getAllGrievanceSubmission
);

router.patch(
  "/grievance-submission/:id/status",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Grievance Submission",
      "update"
    ),
  grievanceController.updateGrievanceSubmissionStatus
);

module.exports = router;
