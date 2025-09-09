const express = require("express");
const {
  previewAnniversaryEmail,
  sendAnniversaryEmail,
} = require("../controller/workAnniversaryController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");
const router = express.Router();

router.get(
  "/anniversary/preview/:employeeId",
  authenticateToken,
  previewAnniversaryEmail
);

router.post(
  "/anniversary/send/:employeeId",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Work Anniversary", "send"),
  sendAnniversaryEmail
);

module.exports = router;
