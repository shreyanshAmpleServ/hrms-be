const express = require('express');
const contactStageController = require('../controller/contactStageController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/contact-stages', authenticateToken, contactStageController.createContactStage);
router.get('/contact-stages/:id', authenticateToken, contactStageController.getContactStageById);
router.put('/contact-stages/:id', authenticateToken, contactStageController.updateContactStage);
router.delete('/contact-stages/:id', authenticateToken, contactStageController.deleteContactStage);
router.get('/contact-stages', authenticateToken, contactStageController.getAllContactStages);

module.exports = router;
