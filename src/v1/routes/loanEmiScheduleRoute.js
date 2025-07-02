const express = require("express");
const loanEmiScheduleController = require("../controller/loanEmiScheduleController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/loan-emi-schedule",
  authenticateToken,
  loanEmiScheduleController.createLoanEmiSchedule
);
router.get(
  "/loan-emi-schedule/:id",
  authenticateToken,
  loanEmiScheduleController.findLoanEmiScheduleById
);
router.put(
  "/loan-emi-schedule/:id",
  authenticateToken,
  loanEmiScheduleController.updateLoanEmiSchedule
);
router.delete(
  "/loan-emi-schedule/:id",
  authenticateToken,
  loanEmiScheduleController.deleteLoanEmiSchedule
);
router.get(
  "/loan-emi-schedule",
  authenticateToken,
  loanEmiScheduleController.getAllLoanEmiSchedule
);

router.patch(
  "/loan-emi-schedule/:id/status",
  authenticateToken,
  loanEmiController.updateLoanEmiScheduleStatus
);

module.exports = router;
