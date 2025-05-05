const express = require('express');
const meetingTypeController = require('../controller/meetingTypeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/meeting-types', authenticateToken, meetingTypeController.createMeetingType);
router.get('/meeting-types/:id', authenticateToken, meetingTypeController.findMeetingTypeById);
router.put('/meeting-types/:id', authenticateToken, meetingTypeController.updateMeetingType);
router.delete('/meeting-types/:id', authenticateToken, meetingTypeController.deleteMeetingType);
router.get('/meeting-types', authenticateToken, meetingTypeController.getAllMeetingTypes);

module.exports = router;
