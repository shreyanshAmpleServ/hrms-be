const express = require("express");
const router = express.Router();
const paymentRecoveryController = require("../controller/paymentRecoveryController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

router.post(
  "/payment-recovery",
  authenticateToken,
  paymentRecoveryController.createPaymentRecovery
);

router.get(
  "/payment-recovery",
  authenticateToken,
  paymentRecoveryController.getAllPaymentRecovery
);

router.get(
  "/payment-recovery/stats",
  authenticateToken,
  paymentRecoveryController.getPaymentRecoveryStats
);

router.get(
  "/payment-recovery/:id",
  authenticateToken,
  paymentRecoveryController.findPaymentRecovery
);

router.put(
  "/payment-recovery/:id",
  authenticateToken,
  paymentRecoveryController.updatePaymentRecovery
);

router.delete(
  "/payment-recovery/:id",
  authenticateToken,
  paymentRecoveryController.deletePaymentRecovery
);

router.patch(
  "/payment-recovery/:id/status",
  paymentRecoveryController.updatePaymentRecoveryStatus
);

module.exports = router;
