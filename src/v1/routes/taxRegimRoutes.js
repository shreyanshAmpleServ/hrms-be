// Country Routes
const express = require("express");
const taxRegimController = require("../controller/taxRegimController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/tax-regime",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Tax Regime", "create"),
  taxRegimController.createTaxRegime
);
router.get(
  "/tax-regime/:id",
  authenticateToken,
  taxRegimController.findTaxRegimeById
);
router.put(
  "/tax-regime/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Tax Regime", "update"),
  taxRegimController.updateTaxRegime
);
router.delete(
  "/tax-regime/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Tax Regime", "delete"),
  taxRegimController.deleteTaxRegime
);
router.get(
  "/tax-regime",
  authenticateToken,
  taxRegimController.getAllTaxRegime
);

module.exports = router;
