const express = require("express");
const router = express.Router();
const assetAssignmentController = require("../controller/assetAssignmentController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

router.post(
  "/asset-assignment",
  authenticateToken,
  assetAssignmentController.createAssetAssignment
);

router.get(
  "/asset-assignment",
  authenticateToken,
  assetAssignmentController.getAllAssetAssignments
);

router.get(
  "/asset-assignment/:id",
  authenticateToken,
  assetAssignmentController.findAssetAssignment
);

// Update a asset assignment by ID
router.put(
  "/asset-assignment/:id",
  authenticateToken,
  assetAssignmentController.updateAssetAssignment
);

// Delete  asset assignment by ID
router.delete(
  "/asset-assignment/:id",
  authenticateToken,
  assetAssignmentController.deleteAssetAssignment
);

module.exports = router;
