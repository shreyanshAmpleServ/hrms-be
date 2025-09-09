const express = require("express");
const eventLogController = require("../controller/eventLogController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/work-life-event-log",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Work Life Event Log",
      "create"
    ),
  eventLogController.createEventLog
);
router.get(
  "/work-life-event-log/:id",
  authenticateToken,
  eventLogController.findEventLogById
);
router.put(
  "/work-life-event-log/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Work Life Event Log",
      "update"
    ),
  eventLogController.updateEventLog
);
router.delete(
  "/work-life-event-log/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Work Life Event Log",
      "delete"
    ),
  eventLogController.deleteEventLog
);
router.get(
  "/work-life-event-log",
  authenticateToken,
  eventLogController.getAllEventLog
);

module.exports = router;
