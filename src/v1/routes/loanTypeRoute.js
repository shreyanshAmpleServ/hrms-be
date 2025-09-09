const express = require("express");
const loanTypeController = require("../controller/loanTypeController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/loan-type",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Loan Type", "create"),
  loanTypeController.createLoanType
);
router.get(
  "/loan-type/:id",
  authenticateToken,
  loanTypeController.findLoanTypeById
);
router.put(
  "/loan-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Loan Type", "update"),
  loanTypeController.updateLoanType
);
router.delete(
  "/loan-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Loan Type", "delete"),
  loanTypeController.deleteLoanType
);
router.get("/loan-type", authenticateToken, loanTypeController.getAllLoanType);

module.exports = router;
