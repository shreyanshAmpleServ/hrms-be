// Country Routes
const express = require("express");
const grievanceTypeController = require("../controller/grievanceTypeController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/grievance-type",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Grievance Type Master",
      "create"
    ),
  grievanceTypeController.createGrievanceType
);
router.get(
  "/grievance-type/:id",
  authenticateToken,
  grievanceTypeController.findGrievanceTypeById
);
router.put(
  "/grievance-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Grievance Type Master",
      "update"
    ),
  grievanceTypeController.updateGrievanceType
);
router.delete(
  "/grievance-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Grievance Type Master",
      "delete"
    ),
  grievanceTypeController.deleteGrievanceType
);
router.get(
  "/grievance-type",
  authenticateToken,
  grievanceTypeController.getAllGrievanceType
);

module.exports = router;
