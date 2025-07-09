const express = require("express");
const router = express.Router();
const overTimeSetupController = require("../controller/overTimeSetupController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

router.post(
  "/overtime-setup",
  authenticateToken,
  overTimeSetupController.createOverTimeSetup
);

router.get(
  "/overtime-setup",
  authenticateToken,
  overTimeSetupController.getAllOverTimeSetup
);

router.get(
  "/overtime-setup/:id",
  authenticateToken,
  overTimeSetupController.findOverTimeSetup
);

router.get(
  "/overtime-setup/run-sp",
  overTimeSetupController.triggerOvertimePostingSP
);
router.put(
  "/overtime-setup/:id",
  authenticateToken,
  overTimeSetupController.updateOverTimeSetup
);

router.delete(
  "/overtime-setup/:id",
  authenticateToken,
  overTimeSetupController.deleteOverTimeSetup
);

module.exports = router;
