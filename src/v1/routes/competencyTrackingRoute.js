const express = require("express");
const competencyTrackingController = require("../controller/competencyTrackingController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/competency-tracking",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Competency Tracking",
      "create"
    ),
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
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Competency Tracking",
      "update"
    ),
  competencyTrackingController.updateCompetencyTracking
);
router.delete(
  "/competency-tracking/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Competency Tracking",
      "delete"
    ),
  competencyTrackingController.deleteCompetencyTracking
);
router.get(
  "/competency-tracking",
  authenticateToken,
  competencyTrackingController.getAllCompetencyTracking
);

module.exports = router;
