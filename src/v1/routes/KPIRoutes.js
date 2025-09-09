// Country Routes
const express = require("express");
const KPIController = require("../controller/KPIController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");
const router = express.Router();

router.post(
  "/kpi",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "KPI Master", "create"),
  KPIController.createKPI
);
router.get("/kpi/:id", authenticateToken, KPIController.findKPIById);
router.put(
  "/kpi/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "KPI Master", "update"),
  KPIController.updateKPI
);
router.delete(
  "/kpi/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "KPI Master", "delete"),
  KPIController.deleteKPI
);
router.get("/kpi", authenticateToken, KPIController.getAllKPI);

module.exports = router;
