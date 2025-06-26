const express = require("express");
const taxSlabController = require("../controller/taxSlabController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/tax-slab", authenticateToken, taxSlabController.createTaxSlab);
router.get(
  "/tax-slab/:id",
  authenticateToken,
  taxSlabController.findTaxSlabById
);
router.put("/tax-slab/:id", authenticateToken, taxSlabController.updateTaxSlab);
router.delete(
  "/tax-slab/:id",
  authenticateToken,
  taxSlabController.deleteTaxSlab
);
router.get("/tax-slab", authenticateToken, taxSlabController.getAllTaxSlab);

module.exports = router;
