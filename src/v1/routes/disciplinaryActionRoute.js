const express = require("express");
const router = express.Router();
const disciplinaryActionController = require("../controller/disciplinaryActionController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create disciplinary action routes
router.post(
  "/diciplinary-action",
  authenticateToken,

  disciplinaryActionController.createDisciplinaryAction
);

// Get all disciplinary actions routes
router.get(
  "/diciplinary-action",
  authenticateToken,
  disciplinaryActionController.getAllDisciplinaryActions
);

// Get a single disciplinary action by ID routes
router.get(
  "/diciplinary-action/:id",
  authenticateToken,
  disciplinaryActionController.getDisciplinaryActionById
);

// Update a disciplinary action by ID routes
router.put(
  "/diciplinary-action/:id",
  authenticateToken,
  disciplinaryActionController.updateDisciplinaryAction
);

// Delete  disciplinary action by ID routes
router.delete(
  "/diciplinary-action/:id",
  authenticateToken,
  disciplinaryActionController.deleteDisciplinaryAction
);

module.exports = router;
