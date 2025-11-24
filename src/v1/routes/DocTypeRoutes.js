// Country Routes
const express = require("express");
const DocTypeController = require("../controller/DocTypeController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/document-type",
  authenticateToken,
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
  DocTypeController.updateDocType
);
router.delete(
  "/document-type/:id",
  authenticateToken,
  DocTypeController.deleteDocType
);
router.get(
  "/document-type",
  authenticateToken,
  DocTypeController.getAllDocType
);

module.exports = router;
