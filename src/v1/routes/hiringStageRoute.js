const express = require("express");
const hiringStageController = require("../controller/hiringStageController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post(
  "/hiring-stage",
  authenticateToken,
  hiringStageController.createHiringStage
);

router.get(
  "/hiring-stage/:id",
  authenticateToken,
  hiringStageController.getHiringStageById
);

router.put(
  "/hiring-stage/:id",
  authenticateToken,
  hiringStageController.updateHiringStage
);

router.delete(
  "/hiring-stage/:id",
  authenticateToken,
  hiringStageController.deleteHiringStage
);

router.get(
  "/hiring-stage",
  authenticateToken,
  hiringStageController.getAllHiringStages
);

router.put(
  "/hiring-stage-status/:id",
  authenticateToken,
  hiringStageController.updateHiringStageStatus
);

module.exports = router;
