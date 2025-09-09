// Country Routes
const express = require("express");
const payComponentController = require("../controller/payComponentController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/pay-component",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Pay Components", "create"),
  payComponentController.createPayComponent
);
router.get(
  "/pay-component/:id",
  authenticateToken,
  payComponentController.findPayComponentById
);

router.put(
  "/pay-component/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Pay Components", "update"),
  payComponentController.updatePayComponent
);

// router.put(
//   "/update-all",
//   authenticateToken,
//   payComponentController.updatePayComponent
// );

router.delete(
  "/pay-component/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Pay Components", "delete"),
  payComponentController.deletePayComponent
);
router.get(
  "/pay-component",
  authenticateToken,
  payComponentController.getAllPayComponent
);

router.get(
  "/pay-component-options",
  authenticateToken,
  payComponentController.getPayComponentOptions
);
module.exports = router;
