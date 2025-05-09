// Country Routes
const express = require('express');
const workScheduleController = require('../controller/workScheduleController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/work-schedule-template', authenticateToken, workScheduleController.createWorkSchedule);
router.get('/work-schedule-template/:id', authenticateToken, workScheduleController.findWorkScheduleById);
router.put('/work-schedule-template/:id', authenticateToken, workScheduleController.updateWorkSchedule);
router.delete('/work-schedule-template/:id', authenticateToken, workScheduleController.deleteWorkSchedule);
router.get('/work-schedule-template', authenticateToken, workScheduleController.getAllWorkSchedule);

module.exports = router;