const express = require("express");
const router = express.Router();
const successionPlanController = require("../controller/successionPlanController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
// Create Succession Planning Entry routes
router.post(
  "/succession-plan",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Succession Planning Entry",
      "create"
    ),
  successionPlanController.createSuccessionPlan
);

// Get all Succession Planning Entrys routes
router.get(
  "/succession-plan",
  authenticateToken,
  successionPlanController.getAllSuccessionPlan
);

// Get a single Succession Planning Entry by ID
router.get(
  "/succession-plan/:id",
  authenticateToken,
  successionPlanController.getSuccessionPlanById
);

// Update a Succession Planning Entry by ID
router.put(
  "/succession-plan/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Succession Planning Entry",
      "update"
    ),
  successionPlanController.updateSuccessionPlan
);

// Delete  Succession Planning Entry by ID
router.delete(
  "/succession-plan/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Succession Planning Entry",
      "delete"
    ),
  successionPlanController.deleteSuccessionPlan
);

module.exports = router;
