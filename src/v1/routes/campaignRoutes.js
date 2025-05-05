const express = require('express');
const CampaignController = require('../controller/CampaignController'); // Assuming the controller is named CampaignController.js
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route to create a new deal
router.post('/campaign', authenticateToken, CampaignController.createCampaign);

// Route to get a specific deal by its ID
router.get('/campaign/:id', authenticateToken, CampaignController.findCampaignById);

// Route to update an existing deal by its ID
router.put('/campaign/:id', authenticateToken, CampaignController.updateCampaign);

// Route to delete a specific deal by its ID
router.delete('/campaign/:id', authenticateToken, CampaignController.deleteCampaign);

// Route to get all deals
router.get('/campaign', authenticateToken, CampaignController.getAllCampaign);

module.exports = router;
