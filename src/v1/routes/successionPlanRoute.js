const express = require("express");
const router = express.Router();
const successionPlanController = require("../controller/successionPlanController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create succession plan routes
router.post(
  "/succession-plan",
  authenticateToken,

  successionPlanController.createSuccessionPlan
);

// Get all succession plans routes
router.get(
  "/succession-plan",
  authenticateToken,
  successionPlanController.getAllSuccessionPlan
);

// Get a single succession plan by ID routes
router.get(
  "/succession-plan/:id",
  authenticateToken,
  successionPlanController.getSuccessionPlanById
);

// Update a succession plan by ID routes
router.put(
  "/succession-plan/:id",
  authenticateToken,
  successionPlanController.updateSuccessionPlan
);

// Delete  succession plan by ID routes
router.delete(
  "/succession-plan/:id",
  authenticateToken,
  successionPlanController.deleteSuccessionPlan
);

module.exports = router;
