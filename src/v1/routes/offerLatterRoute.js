const express = require("express");
const offerLatterController = require("../controller/offerLatterController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/offer-letter",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Offer Letters", "create"),
  offerLatterController.createOfferLetter
);
router.get(
  "/offer-letter/:id",
  authenticateToken,
  offerLatterController.findOfferLetterById
);
router.put(
  "/offer-letter/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Offer Letters", "update"),
  offerLatterController.updateOfferLetter
);
router.delete(
  "/offer-letter/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Offer Letters", "delete"),
  offerLatterController.deleteOfferLetter
);
router.get(
  "/offer-letter",
  authenticateToken,
  offerLatterController.getAllOfferLetter
);
router.patch(
  "/offer-letter/:id/status",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Offer Letters", "update"),
  offerLatterController.updateOfferLetterStatus
);

module.exports = router;
