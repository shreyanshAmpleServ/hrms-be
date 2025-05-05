const express = require('express');
const reasonsController = require('../controller/lostReasonControlller');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/lost-reasons', authenticateToken, reasonsController.createLostReason);
router.get('/lost-reasons/:id', authenticateToken, reasonsController.getLostReasonById);
router.put('/lost-reasons/:id', authenticateToken, reasonsController.updateLostReason);
router.delete('/lost-reasons/:id', authenticateToken, reasonsController.deleteLostReason);
router.get('/lost-reasons', authenticateToken, reasonsController.getAllLostReasons);

module.exports = router;
