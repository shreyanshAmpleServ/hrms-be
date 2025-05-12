// Country Routes
const express = require('express');
const eventTypeController = require('../controller/eventTypeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/work-life-event-type', authenticateToken, eventTypeController.createWorkEventType);
router.get('/work-life-event-type/:id', authenticateToken, eventTypeController.findWorkEventTypeById);
router.put('/work-life-event-type/:id', authenticateToken, eventTypeController.updateWorkEventType);
router.delete('/work-life-event-type/:id', authenticateToken, eventTypeController.deleteWorkEventType);
router.get('/work-life-event-type', authenticateToken, eventTypeController.getAllWorkEventType);

module.exports = router;