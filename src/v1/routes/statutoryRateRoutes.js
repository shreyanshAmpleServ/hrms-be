// Country Routes
const express = require("express");
const statutoryRateController = require("../controller/statutoryRateController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/statutory-rate",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Statutory Rates", "create"),
  statutoryRateController.createStatutoryRate
);
router.get(
  "/statutory-rate/:id",
  authenticateToken,
  statutoryRateController.findStatutoryRateById
);
router.put(
  "/statutory-rate/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Statutory Rates", "update"),
  statutoryRateController.updateStatutoryRate
);
router.delete(
  "/statutory-rate/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Statutory Rates", "delete"),
  statutoryRateController.deleteStatutoryRate
);
router.get(
  "/statutory-rate",
  authenticateToken,
  statutoryRateController.getAllStatutoryRate
);

module.exports = router;
