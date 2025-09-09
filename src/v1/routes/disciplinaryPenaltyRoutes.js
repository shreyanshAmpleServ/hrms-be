// Country Routes
const express = require("express");
const disciplinaryPenaltyController = require("../controller/disciplinaryPenaltyController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");
const router = express.Router();

router.post(
  "/disciplinary-penalty",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Disciplinary Penalty Master",
      "create"
    ),
  disciplinaryPenaltyController.createDisciplinaryPenalty
);
router.get(
  "/disciplinary-penalty/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Disciplinary Penalty Master",
      "read"
    ),
  disciplinaryPenaltyController.findDisciplinaryPenaltyById
);
router.put(
  "/disciplinary-penalty/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Disciplinary Penalty Master",
      "update"
    ),
  disciplinaryPenaltyController.updateDisciplinaryPenalty
);
router.delete(
  "/disciplinary-penalty/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Disciplinary Penalty Master",
      "delete"
    ),
  disciplinaryPenaltyController.deleteDisciplinaryPenalty
);
router.get(
  "/disciplinary-penalty",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Disciplinary Penalty Master",
      "read"
    ),
  disciplinaryPenaltyController.getAllDisciplinaryPenalty
);

module.exports = router;
