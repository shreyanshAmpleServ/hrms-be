const express = require('express');
const appraisalController = require('../controller/appraisalController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/appraisal-entry', authenticateToken,appraisalController.createAppraisalEntry);
router.get('/appraisal-entry/:id', authenticateToken, appraisalController.findAppraisalEntryById);
router.put('/appraisal-entry/:id', authenticateToken,appraisalController.updateAppraisalEntry);
router.delete('/appraisal-entry/:id', authenticateToken, appraisalController.deleteAppraisalEntry);
router.get('/appraisal-entry', authenticateToken, appraisalController.getAllAppraisalEntry);

module.exports = router;
