const express = require("express");
const router = express.Router();
const advancePayment = require("../controller/advancePaymentController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
// Create advance payment routes
router.post(
  "/advance-payment",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Advance Payments", "create"),
  advancePayment.createAdvancePayment
);

// Get all advance payments routes
router.get(
  "/advance-payment",
  authenticateToken,
  advancePayment.getAllAdvancePayments
);

// Get a single advance payment by ID routes
router.get(
  "/advance-payment/:id",
  authenticateToken,
  advancePayment.findAdvancePayment
);

// Update a advance payment by ID routes
router.put(
  "/advance-payment/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Advance Payments", "update"),
  advancePayment.updateAdvancePayment
);

// Delete  advance payment by ID routes
router.delete(
  "/advance-payment/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Advance Payments", "delete"),
  advancePayment.deleteAdvancePayment
);

router.patch(
  "/advance-payment/:idstatus",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Advance Payments", "update"),
  advancePayment.updateAdvancePaymentStatus
);

module.exports = router;
