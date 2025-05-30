const express = require("express");
const router = express.Router();
const assetAssignmentController = require("../controller/assetAssignmentController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create asset assignment routes
router.post(
  "/asset-assignment",
  authenticateToken,
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

// Update a asset assignment by ID routes
router.put(
  "/asset-assignment/:id",
  authenticateToken,
  assetAssignmentController.updateAssetAssignment
);

// Delete  asset assignment by ID routes
router.delete(
  "/asset-assignment/:id",
  authenticateToken,
  assetAssignmentController.deleteAssetAssignment
);

module.exports = router;
