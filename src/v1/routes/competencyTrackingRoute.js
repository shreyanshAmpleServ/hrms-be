const express = require("express");
const competencyTrackingController = require("../controller/competencyTrackingController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/competency-tracking",
  authenticateToken,
  competencyTrackingController.createCompetencyTracking
);
router.get(
  "/competency-tracking/:id",
  authenticateToken,
  competencyTrackingController.findCompetencyTrackingById
);
router.put(
  "/competency-tracking/:id",
  authenticateToken,
  competencyTrackingController.updateCompetencyTracking
);
router.delete(
  "/competency-tracking/:id",
  authenticateToken,
  competencyTrackingController.deleteCompetencyTracking
);
router.get(
  "/competency-tracking",
  authenticateToken,
  competencyTrackingController.getAllCompetencyTracking
);

module.exports = router;
