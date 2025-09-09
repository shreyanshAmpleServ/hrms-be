// Currency Routes
const express = require("express");
const currencyController = require("../controller/currencyController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/currencies",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Currencies", "create"),
  currencyController.createCurrency
);
router.get(
  "/currencies/:id",
  authenticateToken,
  currencyController.getCurrencyById
);
router.put(
  "/currencies/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Currencies", "update"),
  currencyController.updateCurrency
);
router.delete(
  "/currencies/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Currencies", "delete"),
  currencyController.deleteCurrency
);
router.get(
  "/currencies",
  authenticateToken,
  currencyController.getAllCurrencies
);

module.exports = router;
