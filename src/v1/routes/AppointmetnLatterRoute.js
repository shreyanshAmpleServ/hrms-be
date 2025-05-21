const express = require('express');
const AppointmentLatterController = require('../controller/AppointmentLatterController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/appointment-latter', authenticateToken, AppointmentLatterController.createAppointmentLatter);
router.get('/appointment-latter/:id', authenticateToken, AppointmentLatterController.findAppointmentLatterById);
router.put('/appointment-latter/:id', authenticateToken, AppointmentLatterController.updateAppointmentLatter);
router.delete('/appointment-latter/:id', authenticateToken, AppointmentLatterController.deleteAppointmentLatter);
router.get('/appointment-latter', authenticateToken, AppointmentLatterController.getAllAppointmentLatter);

module.exports = router;
