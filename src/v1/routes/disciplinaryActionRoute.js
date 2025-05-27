const express = require("express");
const router = express.Router();
const disciplinaryActionController = require("../controller/disciplinaryActionController.js");

// Create disciplinary action routes
router.post(
  "/createDiscplinaryAction",
  disciplinaryActionController.createDisciplinaryAction
);

// Get all disciplinary actions routes
router.get(
  "/getAllDiscplinaryAction",
  disciplinaryActionController.getAllDisciplinaryActions
);

// Get a single disciplinary action by ID routes
router.get("/:id", disciplinaryActionController.getDisciplinaryActionById);

// Update a disciplinary action by ID routes
router.put("/:id", disciplinaryActionController.updateDisciplinaryAction);

// Delete  disciplinary action by ID routes
router.delete("/:id", disciplinaryActionController.deleteDisciplinaryAction);

module.exports = router;
