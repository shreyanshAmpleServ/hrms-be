// Country Routes
const express = require("express");
const DocTypeController = require("../controller/DocTypeController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");
const router = express.Router();

router.post(
  "/document-type",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Document Type Master",
      "create"
    ),
  DocTypeController.createDocType
);
router.get(
  "/document-type/:id",
  authenticateToken,
  DocTypeController.findDocTypeById
);
router.put(
  "/document-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Document Type Master",
      "update"
    ),
  DocTypeController.updateDocType
);
router.delete(
  "/document-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Document Type Master",
      "delete"
    ),
  DocTypeController.deleteDocType
);
router.get(
  "/document-type",
  authenticateToken,
  DocTypeController.getAllDocType
);

module.exports = router;
