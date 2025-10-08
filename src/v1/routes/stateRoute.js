const express = require("express");
const stateController = require("../controller/stateController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/states", authenticateToken, stateController.getAllStates);

router.get("/states/:id", authenticateToken, stateController.getStateById);

router.post("/states", authenticateToken, stateController.createState);

router.put("/states/:id", authenticateToken, stateController.updateState);

router.delete("/states/:id", authenticateToken, stateController.deleteState);

module.exports = router;
