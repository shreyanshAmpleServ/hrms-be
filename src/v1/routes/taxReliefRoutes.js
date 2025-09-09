// Country Routes
const express = require("express");
const taxReliefController = require("../controller/taxReliefController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/tax-relief",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Tax Relief", "create"),
  taxReliefController.createTaxRelief
);
router.get(
  "/tax-relief/:id",
  authenticateToken,
  taxReliefController.findTaxReliefById
);
router.put(
  "/tax-relief/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Tax Relief", "update"),
  taxReliefController.updateTaxRelief
);
router.delete(
  "/tax-relief/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Tax Relief", "delete"),
  taxReliefController.deleteTaxRelief
);
router.get(
  "/tax-relief",
  authenticateToken,
  taxReliefController.getAllTaxRelief
);

module.exports = router;
