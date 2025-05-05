const express = require('express');
const casesController = require('../controller/casesController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/cases', authenticateToken,casesController.createCases);
router.get('/cases/:id', authenticateToken, casesController.findCasesById);
router.put('/cases/:id',authenticateToken, casesController.updateCases);
router.delete('/cases/:id', authenticateToken, casesController.deleteCase);
router.get('/cases', authenticateToken, casesController.getAllCases);
router.get('/case-reason', authenticateToken, casesController.getAllCaseReasons);
router.get('/case-number', authenticateToken, casesController.generateCaseNumber);

module.exports = router;
