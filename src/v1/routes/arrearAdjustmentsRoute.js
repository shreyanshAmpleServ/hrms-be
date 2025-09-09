const express = require("express");
const router = express.Router();
const arrearAdjustmentsController = require("../controller/arrearAdjustmentsContoller.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

// Create arrear adjustment routes
router.post(
  "/arrear-adjustment",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Arrear Adjustments", "create"),
  arrearAdjustmentsController.createArrearAdjustment
);

// Get all arrear adjustments routes
router.get(
  "/arrear-adjustment",
  authenticateToken,
  arrearAdjustmentsController.getAllArrearAdjustment
);

// Get a single arrear adjustment by ID routes
router.get(
  "/arrear-adjustment/:id",
  authenticateToken,
  arrearAdjustmentsController.findArrearAdjustment
);

// Update a arrear adjustment by ID routes
router.put(
  "/arrear-adjustment/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Arrear Adjustments", "update"),
  arrearAdjustmentsController.updateArrearAdjustment
);

// Delete  arrear adjustment by ID routes
router.delete(
  "/arrear-adjustment/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Arrear Adjustments", "delete"),
  arrearAdjustmentsController.deleteArrearAdjustment
);

module.exports = router;
