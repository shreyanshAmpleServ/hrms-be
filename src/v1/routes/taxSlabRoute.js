const express = require("express");
const taxSlabController = require("../controller/taxSlabController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/tax-slab",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Tax Slab", "create"),
  taxSlabController.createTaxSlab
);
router.get(
  "/tax-slab/:id",
  authenticateToken,
  taxSlabController.findTaxSlabById
);
router.put(
  "/tax-slab/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Tax Slab", "update"),
  taxSlabController.updateTaxSlab
);
router.delete(
  "/tax-slab/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Tax Slab", "delete"),
  taxSlabController.deleteTaxSlab
);
router.get("/tax-slab", authenticateToken, taxSlabController.getAllTaxSlab);

module.exports = router;
