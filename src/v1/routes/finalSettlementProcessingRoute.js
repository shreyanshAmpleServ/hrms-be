const express = require("express");
const router = express.Router();
const finalSettlementProcessingController = require("../controller/finalSettlementProcessingController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

router.post(
  "/final-settlement-processing",
  authenticateToken,
  finalSettlementProcessingController.createFinalSettlementProcessing
);

router.get(
  "/final-settlement-processing",
  authenticateToken,
  finalSettlementProcessingController.getAllFinalSettlementProcessing
);

router.get(
  "/final-settlement-processing/:id",
  authenticateToken,
  finalSettlementProcessingController.findFinalSettlementProcessing
);

router.put(
  "/final-settlement-processing/:id",
  authenticateToken,
  finalSettlementProcessingController.updateFinalSettlementProcessing
);

router.delete(
  "/final-settlement-processing/:id",
  authenticateToken,
  finalSettlementProcessingController.deleteFinalSettlementProcessing
);

module.exports = router;
