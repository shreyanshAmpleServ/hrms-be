// Country Routes
const express = require("express");
const eventTypeController = require("../controller/eventTypeController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/work-life-event-type",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Work Life Event Type Master",
      "create"
    ),
  eventTypeController.createWorkEventType
);
router.get(
  "/work-life-event-type/:id",
  authenticateToken,
  eventTypeController.findWorkEventTypeById
);
router.put(
  "/work-life-event-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Work Life Event Type Master",
      "update"
    ),
  eventTypeController.updateWorkEventType
);
router.delete(
  "/work-life-event-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Work Life Event Type Master",
      "delete"
    ),
  eventTypeController.deleteWorkEventType
);
router.get(
  "/work-life-event-type",
  authenticateToken,
  eventTypeController.getAllWorkEventType
);

module.exports = router;
