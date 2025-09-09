const express = require("express");
const loanReqController = require("../controller/loanReqController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/loan-requests",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Loan Requests", "create"),
  loanReqController.createLoanRequest
);
router.get(
  "/loan-requests/:id",
  authenticateToken,
  loanReqController.findLoanRequestById
);
router.put(
  "/loan-requests/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Loan Requests", "update"),
  loanReqController.updateLoanRequest
);
router.delete(
  "/loan-requests/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Loan Requests", "delete"),
  loanReqController.deleteLoanRequest
);
router.get(
  "/loan-requests",
  authenticateToken,
  loanReqController.getAllLoanRequest
);

router.patch(
  "/loan-requests/:id/status",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Loan Requests", "update"),
  loanReqController.updateLoanReqStatus
);

module.exports = router;
