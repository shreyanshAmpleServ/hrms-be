const express = require("express");
const router = express.Router();
const kpiProgressController = require("../controller/kpiProgressController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create KPI progress routes
router.post(
  "/kpi-progress",
  authenticateToken,

  kpiProgressController.createKpiProgress
);

// Get all KPI progress routes
router.get(
  "/kpi-progress",
  authenticateToken,
  kpiProgressController.getAllKpiProgress
);

// Get a single KPI progress by ID routes
router.get(
  "/kpi-progress/:id",
  authenticateToken,
  kpiProgressController.findKpiProgress
);

// Update a KPI progress by ID routes
router.put(
  "/kpi-progress/:id",
  authenticateToken,
  kpiProgressController.updateKpiProgress
);

// Delete  KPI progress by ID routes
router.delete(
  "/kpi-progress/:id",
  authenticateToken,
  kpiProgressController.deleteKpiProgress
);

module.exports = router;
