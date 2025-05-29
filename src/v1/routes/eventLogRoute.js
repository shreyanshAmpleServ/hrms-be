const express = require("express");
const eventLogController = require("../controller/eventLogController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/work-life-event-log",
  authenticateToken,
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
  eventLogController.updateEventLog
);
router.delete(
  "/work-life-event-log/:id",
  authenticateToken,
  eventLogController.deleteEventLog
);
router.get(
  "/work-life-event-log",
  authenticateToken,
  eventLogController.getAllEventLog
);

module.exports = router;
