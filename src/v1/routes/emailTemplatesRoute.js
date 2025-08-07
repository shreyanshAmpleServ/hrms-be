const express = require("express");
const router = express.Router();
const emailTemplateController = require("../controllers/emailTemplateController.js");

router.post("/email-template", emailTemplateController.createEmailTemplate);
router.get("/email-template", emailTemplateController.getAllEmailTemplate);
router.get("/email-template/:id", emailTemplateController.getEmailTemplateById);
router.put("/email-template/:id", emailTemplateController.updateEmailTemplate);
router.delete(
  "/email-template/:id",
  emailTemplateController.deleteEmailTemplate
);

module.exports = router;
