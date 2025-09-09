const express = require("express");
const appraisalController = require("../controller/appraisalController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/appraisal-entry",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Appraisals", "create"),
  appraisalController.createAppraisalEntry
);
router.get(
  "/appraisal-entry/:id",
  authenticateToken,
  appraisalController.findAppraisalEntryById
);
router.put(
  "/appraisal-entry/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Appraisals", "update"),
  appraisalController.updateAppraisalEntry
);
router.delete(
  "/appraisal-entry/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Appraisals", "delete"),
  appraisalController.deleteAppraisalEntry
);
router.get(
  "/appraisal-entry",
  authenticateToken,
  appraisalController.getAllAppraisalEntry
);

module.exports = router;
