// Country Routes
const express = require("express");
const shiftController = require("../controller/shiftController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/shift",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Shift", "create"),
  shiftController.createShift
);
router.get("/shift/:id", authenticateToken, shiftController.findShiftById);
router.put(
  "/shift/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Shift", "update"),
  shiftController.updateShift
);
router.delete(
  "/shift/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Shift", "delete"),
  shiftController.deleteShift
);
router.get("/shift", authenticateToken, shiftController.getAllShift);

module.exports = router;
