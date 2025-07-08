const express = require("express");
const router = express.Router();
const loanMasterController = require("../controller/loanMasterController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

router.post(
  "/loan-master",
  authenticateToken,
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
  loanMasterController.updateLoanMaster
);

router.delete(
  "/loan-master/:id",
  authenticateToken,
  loanMasterController.deleteLoanMaster
);

module.exports = router;
