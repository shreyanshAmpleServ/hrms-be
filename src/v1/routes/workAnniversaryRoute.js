const express = require("express");
const {
  previewAnniversaryEmail,
  sendAnniversaryEmail,
} = require("../controller/workAnniversaryController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/anniversary/preview/:employeeId", previewAnniversaryEmail);

router.post(
  "/anniversary/send/:employeeId",
  authenticateToken,
  sendAnniversaryEmail
);

module.exports = router;
