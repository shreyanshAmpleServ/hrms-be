const express = require("express");
const router = express.Router();
const arrearAdjustmentsController = require("../controller/arrearAdjustmentsContoller.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create arrear adjustment routes
router.post(
  "/arrear-adjustment",
  authenticateToken,
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
  arrearAdjustmentsController.updateArrearAdjustment
);

// Delete  arrear adjustment by ID routes
router.delete(
  "/arrear-adjustment/:id",
  authenticateToken,
  arrearAdjustmentsController.deleteArrearAdjustment
);

module.exports = router;
