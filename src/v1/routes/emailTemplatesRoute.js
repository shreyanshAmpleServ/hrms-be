const express = require("express");
const router = express.Router();
const emailTemplateController = require("../controllers/emailTemplateController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

router.post(
  "/email-template",
  authenticateToken,
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
  emailTemplateController.updateEmailTemplate
);
router.delete(
  "/email-template/:id",
  authenticateToken,
  emailTemplateController.deleteEmailTemplate
);

module.exports = router;
