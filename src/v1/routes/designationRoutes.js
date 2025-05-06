// Country Routes
const express = require('express');
const designationController = require('../controller/designationController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/designation', authenticateToken, designationController.createDesignation);
router.get('/designation/:id', authenticateToken, designationController.findDesignationById);
router.put('/designation/:id', authenticateToken, designationController.updateDesignation);
router.delete('/designation/:id', authenticateToken, designationController.deleteDesignation);
router.get('/designation', authenticateToken, designationController.getAllDesignation);

module.exports = router;