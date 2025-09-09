const express = require("express");
const userController = require("../controller/userControlle");
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/UploadFileMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/users",
  authenticateToken,
  upload.single("profile_img"),
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Manage Users", "create"),
  userController.createUser
); // Create a new user
router.get("/users/:id", authenticateToken, userController.getUserById); // Get user by ID
router.get(
  "/users/email/:email",
  authenticateToken,
  userController.getUserByEmail
); // Get user by email
router.put(
  "/users/:id",
  authenticateToken,
  upload.single("profile_img"),
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Manage Users", "update"),
  userController.updateUser
); // Update user by ID
router.delete(
  "/users/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Manage Users", "delete"),
  userController.deleteUser
); // Delete user by ID
router.get("/users", authenticateToken, userController.getAllUsers); // Get all users
router.get("/userByToken", authenticateToken, userController.getUserByToken); // Get users by token

module.exports = router;
