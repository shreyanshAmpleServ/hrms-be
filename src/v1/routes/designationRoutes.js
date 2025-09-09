const express = require("express");
const designationController = require("../controller/designationController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/designation",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Designation", "create"),
  designationController.createDesignation
);
router.get(
  "/designation/:id",
  authenticateToken,
  designationController.findDesignationById
);
router.put(
  "/designation/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Designation", "update"),
  designationController.updateDesignation
);
router.delete(
  "/designation/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Designation", "delete"),
  designationController.deleteDesignation
);
router.get(
  "/designation",
  authenticateToken,
  designationController.getAllDesignation
);
router.get(
  "/designation-options",
  authenticateToken,
  designationController.getDesignationOptions
);

module.exports = router;
