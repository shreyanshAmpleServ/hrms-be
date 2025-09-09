// Country Routes
const express = require("express");
const awartTypeController = require("../controller/awardTypeController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/award-type",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Award Types", "create"),
  awartTypeController.createAwardType
);
router.get(
  "/award-type/:id",
  authenticateToken,
  awartTypeController.findAwardTypeById
);
router.put(
  "/award-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Award Types", "update"),
  awartTypeController.updateAwardType
);
router.delete(
  "/award-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Award Types", "delete"),
  awartTypeController.deleteAwardType
);
router.get(
  "/award-type",
  authenticateToken,
  awartTypeController.getAllAwardType
);

module.exports = router;
