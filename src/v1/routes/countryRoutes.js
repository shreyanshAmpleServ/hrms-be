// Country Routes
const express = require('express');
const countryController = require('../controller/countryController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/countries', authenticateToken, countryController.createCountry);
router.get('/countries/:id', authenticateToken, countryController.getCountryById);
router.put('/countries/:id', authenticateToken, countryController.updateCountry);
router.delete('/countries/:id', authenticateToken, countryController.deleteCountry);
router.get('/countries', authenticateToken, countryController.getAllCountries);

module.exports = router;