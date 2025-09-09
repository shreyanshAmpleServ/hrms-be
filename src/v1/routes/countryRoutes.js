// Country Routes
const express = require("express");
const countryController = require("../controller/countryController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/countries",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Countries", "create"),
  countryController.createCountry
);
router.get(
  "/countries/:id",
  authenticateToken,
  countryController.getCountryById
);
router.put(
  "/countries/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Countries", "update"),
  countryController.updateCountry
);
router.delete(
  "/countries/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Countries", "delete"),
  countryController.deleteCountry
);
router.get("/countries", authenticateToken, countryController.getAllCountries);

module.exports = router;
