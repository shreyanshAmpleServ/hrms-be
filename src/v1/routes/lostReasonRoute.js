const express = require("express");
const reasonsController = require("../controller/lostReasonControlller");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/lost-reasons",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Lost Reason", "create"),
  reasonsController.createLostReason
);
router.get(
  "/lost-reasons/:id",
  authenticateToken,
  reasonsController.getLostReasonById
);
router.put(
  "/lost-reasons/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Lost Reason", "update"),
  reasonsController.updateLostReason
);
router.delete(
  "/lost-reasons/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Lost Reason", "delete"),
  reasonsController.deleteLostReason
);
router.get(
  "/lost-reasons",
  authenticateToken,
  reasonsController.getAllLostReasons
);

module.exports = router;
