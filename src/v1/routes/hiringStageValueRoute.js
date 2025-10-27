const express = require("express");
const hiringStageValueController = require("../controller/hiringStageValueController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post(
  "/hiring-stage-value",
  authenticateToken,
  hiringStageValueController.createHiringStageValue
);

router.get(
  "/hiring-stage-value/:id",
  authenticateToken,
  hiringStageValueController.getHiringStageValueById
);

router.put(
  "/hiring-stage-value/:id",
  authenticateToken,
  hiringStageValueController.updateHiringStageValue
);

router.delete(
  "/hiring-stage-value/:id",
  authenticateToken,
  hiringStageValueController.deleteHiringStageValue
);

router.get(
  "/hiring-stage-value",
  authenticateToken,
  hiringStageValueController.getAllHiringStageValues
);

module.exports = router;
