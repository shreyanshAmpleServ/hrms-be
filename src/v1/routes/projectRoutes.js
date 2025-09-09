const express = require("express");
const projectController = require("../controller/projectController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

const router = express.Router();

router.post(
  "/projects",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Projects", "create"),
  projectController.createProject
);
router.get(
  "/projects/:id",
  authenticateToken,
  projectController.getProjectById
);
router.put(
  "/projects/:id",
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Projects", "update"),
  authenticateToken,
  projectController.updateProject
);
router.delete(
  "/projects/:id",
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Projects", "delete"),
  authenticateToken,
  projectController.deleteProject
);
router.get("/projects", authenticateToken, projectController.getAllProjects);

module.exports = router;
