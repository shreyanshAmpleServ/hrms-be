const express = require("express");
const AppointmentLatterController = require("../controller/AppointmentLatterController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/appointment-letter",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Appointment Letters",
      "create"
    ),
  AppointmentLatterController.createAppointmentLatter
);
router.get(
  "/appointment-letter/:id",
  authenticateToken,
  AppointmentLatterController.findAppointmentLatterById
);
router.put(
  "/appointment-letter/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Appointment Letters",
      "update"
    ),
  AppointmentLatterController.updateAppointmentLatter
);
router.delete(
  "/appointment-letter/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Appointment Letters",
      "delete"
    ),
  AppointmentLatterController.deleteAppointmentLatter
);
router.get(
  "/appointment-letter",
  authenticateToken,
  AppointmentLatterController.getAllAppointmentLatter
);

module.exports = router;
