const express = require("express");
const router = express.Router();
const advancePayment = require("../controller/advancePaymentController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create advance payment routes
router.post(
  "/advance-payment",
  authenticateToken,
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
  advancePayment.updateAdvancePayment
);

// Delete  advance payment by ID routes
router.delete(
  "/advance-payment/:id",
  authenticateToken,
  advancePayment.deleteAdvancePayment
);

module.exports = router;
