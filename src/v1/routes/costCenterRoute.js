const express = require("express");
const router = express.Router();
const costCenterController = require("../controller/costCenterController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
// Create probation review  routes
router.post(
  "/cost-center",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Cost Center", "create"),
  costCenterController.createCostCenter
);

// Get all probation reviews routes
router.get(
  "/cost-center",
  authenticateToken,
  costCenterController.getAllCostCenter
);

// Get a single probation review by ID routes
router.get(
  "/cost-center/:id",
  authenticateToken,
  costCenterController.findCostCenter
);

// Update a probation review by ID routes
router.put(
  "/cost-center/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Cost Center", "update"),
  costCenterController.updateCostCenter
);

// Delete  probation review by ID routes
router.delete(
  "/cost-center/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Cost Center", "delete"),
  costCenterController.deleteCostCenter
);

module.exports = router;
