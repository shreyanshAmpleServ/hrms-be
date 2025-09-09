const express = require("express");
const router = express.Router();
const assetAssignmentController = require("../controller/assetAssignmentController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

// Create asset assignment routes
router.post(
  "/asset-assignment",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Asset Assignments", "create"),
  assetAssignmentController.createAssetAssignment
);

// Get all asset assignments routes
router.get(
  "/asset-assignment",
  authenticateToken,
  assetAssignmentController.getAllAssetAssignments
);

// Get a single asset assignment by ID routes
router.get(
  "/asset-assignment/:id",
  authenticateToken,
  assetAssignmentController.findAssetAssignment
);

// Update a asset assignment by ID
router.put(
  "/asset-assignment/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Asset Assignments", "update"),
  assetAssignmentController.updateAssetAssignment
);

// Delete  asset assignment by ID
router.delete(
  "/asset-assignment/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Asset Assignments", "delete"),
  assetAssignmentController.deleteAssetAssignment
);

module.exports = router;
