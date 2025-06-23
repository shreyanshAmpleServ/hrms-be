const express = require("express");
const grievanceController = require("../controller/grievanceController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/grievance-submission",
  authenticateToken,
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
  grievanceController.updateGrievanceSubmission
);
router.delete(
  "/grievance-submission/:id",
  authenticateToken,
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
  grievanceController.updateGrievanceSubmissionStatus
);

module.exports = router;
