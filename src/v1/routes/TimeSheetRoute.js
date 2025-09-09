const express = require("express");
const TimeSheetController = require("../controller/TimeSheetController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/time-sheet",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Time Sheet Entry", "create"),
  TimeSheetController.createTimeSheet
);
router.get(
  "/time-sheet/:id",
  authenticateToken,
  TimeSheetController.findTimeSheetById
);
router.put(
  "/time-sheet/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Time Sheet Entry", "update"),
  TimeSheetController.updateTimeSheet
);
router.delete(
  "/time-sheet/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Time Sheet Entry", "delete"),
  TimeSheetController.deleteTimeSheet
);
router.get(
  "/time-sheet",
  authenticateToken,
  TimeSheetController.getAllTimeSheet
);

module.exports = router;
