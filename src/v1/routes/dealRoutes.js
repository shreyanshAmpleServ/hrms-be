const express = require('express');
const dealController = require('../controller/dealController'); // Assuming the controller is named dealController.js
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route to create a new deal
router.post('/deals', authenticateToken, dealController.createDeal);

// Route to get a specific deal by its ID
router.get('/deals/:id', authenticateToken, dealController.getDealById);

// Route to update an existing deal by its ID
router.put('/deals/:id', authenticateToken, dealController.updateDeal);

// Route to delete a specific deal by its ID
router.delete('/deals/:id', authenticateToken, dealController.deleteDeal);

// Route to get all deals
router.get('/deals', authenticateToken, dealController.getAllDeals);

module.exports = router;
