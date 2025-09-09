const express = require("express");
const taxSetupController = require("../controller/taxSetupController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/tax-setup",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Tax Slab", "create"),
  taxSetupController.createTaxSetup
);
router.get(
  "/tax-setup/:id",
  authenticateToken,
  taxSetupController.findTaxSetupById
);
router.put(
  "/tax-setup/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Tax Slab", "update"),
  taxSetupController.updateTaxSetup
);
router.delete(
  "/tax-setup/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Tax Slab", "delete"),
  taxSetupController.deleteSetup
);
router.get("/tax-setup", authenticateToken, taxSetupController.getAllTaxSetup);

module.exports = router;
