const express = require("express");
const payRollSettingsController = require("../controller/payrollConfigrationController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post(
  "/payroll-config-setting",
  authenticateToken,
  payRollSettingsController.createPayRollConfigSetting
);

router.put(
  "/payroll-config-setting/:id",
  authenticateToken,
  payRollSettingsController.updatePayRollConfigSetting
);

router.get(
  "/payroll-config-setting/:id",
  authenticateToken,
  payRollSettingsController.getPayRollConfigSettingById
);
router.get(
  "/payroll-config-setting",
  authenticateToken,
  payRollSettingsController.getAllPayRollConfigSetting
);
router.delete(
  "/payroll-config-setting/:id",
  authenticateToken,
  // (req, res, next) =>
  //   setupNotificationMiddleware(req, res, next, "PayRollConfigSetting Master", "delete"),
  payRollSettingsController.deletePayRollConfigSetting
);

module.exports = router;
