const express = require("express");
const roleController = require("../controller/roleController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/roles",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Roles & Permission", "create"),
  roleController.createRole
);
router.get("/roles/:id", authenticateToken, roleController.getRoleById);
router.put(
  "/roles/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Roles & Permission", "update"),
  roleController.updateRole
);
router.delete(
  "/roles/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Roles & Permission", "delete"),
  roleController.deleteRole
);
router.get("/roles", authenticateToken, roleController.getAllRoles);

module.exports = router;
