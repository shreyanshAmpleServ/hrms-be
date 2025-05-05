const express = require('express');
const industryController = require('../controller/industryController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/industries', authenticateToken, industryController.createIndustry);
router.get('/industries/:id', authenticateToken, industryController.getIndustryById);
router.put('/industries/:id', authenticateToken, industryController.updateIndustry);
router.delete('/industries/:id', authenticateToken, industryController.deleteIndustry);
router.get('/industries', authenticateToken, industryController.getAllIndustries);

module.exports = router;
