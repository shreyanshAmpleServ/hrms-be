const express = require("express");
const router = express.Router();
const emailTemplateController = require("../controllers/emailTemplateController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

router.post(
  "/email-template",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Email Template", "create"),
  emailTemplateController.createEmailTemplate
);
router.get(
  "/email-template",
  authenticateToken,
  emailTemplateController.getAllEmailTemplate
);
router.get(
  "/email-template/:id",
  authenticateToken,
  emailTemplateController.getEmailTemplateById
);
router.put(
  "/email-template/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Email Template", "update"),
  emailTemplateController.updateEmailTemplate
);
router.delete(
  "/email-template/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Email Template", "delete"),
  emailTemplateController.deleteEmailTemplate
);

module.exports = router;
