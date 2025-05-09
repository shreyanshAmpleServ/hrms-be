// Country Routes
const express = require('express');
const HolidayCalenderController = require('../controller/HolidayCalenderController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/holiday-calender', authenticateToken, HolidayCalenderController.createHoliday);
router.get('/holiday-calender/:id', authenticateToken, HolidayCalenderController.findHolidayById);
router.put('/holiday-calender/:id', authenticateToken, HolidayCalenderController.updateHoliday);
router.delete('/holiday-calender/:id', authenticateToken, HolidayCalenderController.deleteHoliday);
router.get('/holiday-calender', authenticateToken, HolidayCalenderController.getAllHoliday);

module.exports = router;