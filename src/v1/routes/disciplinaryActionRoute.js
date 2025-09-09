const express = require("express");
const router = express.Router();
const disciplinaryActionController = require("../controller/disciplinaryActionController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");
// Create disciplinary action routes
router.post(
  "/disciplinary-action",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Disciplinary Action Log",
      "create"
    ),

  disciplinaryActionController.createDisciplinaryAction
);

// Get all disciplinary actions routes
router.get(
  "/disciplinary-action",
  authenticateToken,
  disciplinaryActionController.getAllDisciplinaryActions
);

// Get a single disciplinary action by ID routes
router.get(
  "/disciplinary-action/:id",
  authenticateToken,
  disciplinaryActionController.getDisciplinaryActionById
);

// Update a disciplinary action by ID routes
router.put(
  "/disciplinary-action/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Disciplinary Action Log",
      "update"
    ),
  disciplinaryActionController.updateDisciplinaryAction
);

// Delete  disciplinary action by ID routes
router.delete(
  "/disciplinary-action/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Disciplinary Action Log",
      "delete"
    ),
  disciplinaryActionController.deleteDisciplinaryAction
);

router.patch(
  "/disciplinary-action/:id/status",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Disciplinary Action Log",
      "update"
    ),
  disciplinaryActionController.updateDisciplinaryActionStatus
);

module.exports = router;
