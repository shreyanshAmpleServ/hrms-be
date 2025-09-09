// Country Routes
const express = require("express");
const workScheduleController = require("../controller/workScheduleController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/work-schedule-template",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Work Schedule", "create"),
  workScheduleController.createWorkSchedule
);
router.get(
  "/work-schedule-template/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Work Schedule", "read"),
  workScheduleController.findWorkScheduleById
);
router.put(
  "/work-schedule-template/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Work Schedule", "update"),
  workScheduleController.updateWorkSchedule
);
router.delete(
  "/work-schedule-template/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Work Schedule", "delete"),
  workScheduleController.deleteWorkSchedule
);
router.get(
  "/work-schedule-template",
  authenticateToken,
  workScheduleController.getAllWorkSchedule
);

module.exports = router;
