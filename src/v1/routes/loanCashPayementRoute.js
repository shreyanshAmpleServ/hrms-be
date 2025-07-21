const express = require("express");
const router = express.Router();
const loanCashPayementController = require("../controller/loanCashPayementController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create probation review  routes
router.post(
  "/loancash-payement",
  authenticateToken,

  loanCashPayementController.createLoanCashPayement
);

// Get all probation reviews routes
router.get(
  "/loancash-payement",
  authenticateToken,
  loanCashPayementController.getAllLoanCashPayement
);

// Get a single probation review by ID routes
router.get(
  "/loancash-payement/:id",
  authenticateToken,
  loanCashPayementController.findLoanCashPayement
);

// Update a probation review by ID routes
router.put(
  "/loancash-payement/:id",
  authenticateToken,
  loanCashPayementController.updateLoanCashPayement
);

// Delete  probation review by ID routes
router.delete(
  "/loancash-payement/:id",
  authenticateToken,
  loanCashPayementController.deleteLoanCashPayement
);

module.exports = router;
