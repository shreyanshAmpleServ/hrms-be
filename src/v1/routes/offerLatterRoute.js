const express = require("express");
const offerLatterController = require("../controller/offerLatterController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post(
  "/offer-letter",
  authenticateToken,
  offerLatterController.createOfferLetter
);

router.get(
  "/offer-letter/:id/download",
  authenticateToken,
  offerLatterController.downloadOfferLetterPDF
);
router.get(
  "/offer-letter/:id",
  authenticateToken,
  offerLatterController.findOfferLetterById
);
router.put(
  "/offer-letter/:id",
  authenticateToken,
  offerLatterController.updateOfferLetter
);
router.delete(
  "/offer-letter/:id",
  authenticateToken,
  offerLatterController.deleteOfferLetter
);
router.get(
  "/offer-letter",
  authenticateToken,
  offerLatterController.getAllOfferLetter
);

router.patch(
  "/offer-letter/:id/status",
  authenticateToken,
  offerLatterController.updateOfferLetterStatus
);

module.exports = router;
