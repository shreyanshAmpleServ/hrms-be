const express = require("express");
const router = express.Router();
const loanMasterController = require("../controller/loanMasterController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

router.post(
  "/loan-master",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Loan Master", "create"),
  loanMasterController.createLoanMaster
);

router.get(
  "/loan-master",
  authenticateToken,
  loanMasterController.getAllLoanMaster
);

router.get(
  "/loan-master/:id",
  authenticateToken,
  loanMasterController.findLoanMaster
);

router.put(
  "/loan-master/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Loan Master", "update"),
  loanMasterController.updateLoanMaster
);

router.delete(
  "/loan-master/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Loan Master", "delete"),
  loanMasterController.deleteLoanMaster
);

module.exports = router;
