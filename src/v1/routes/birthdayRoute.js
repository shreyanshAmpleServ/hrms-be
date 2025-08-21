const express = require("express");
const {
  previewBirthdayEmail,
  sendBirthdayEmail,
} = require("../controller/birthdayController.js");

const router = express.Router();

router.get("/birthday/preview/:employeeId", previewBirthdayEmail);

router.post("/birthday/send/:employeeId", sendBirthdayEmail);

module.exports = router;
