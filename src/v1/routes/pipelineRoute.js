const express = require('express');
const pipelineController = require('../controller/pipelineController'); // Assuming the controller is named pipelineController.js
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route to create a new pipeline
router.post('/pipelines', authenticateToken, pipelineController.createPipeline);

// Route to get a specific pipeline by its ID
router.get('/pipelines/:id', authenticateToken, pipelineController.getPipelineById);

// Route to update an existing pipeline by its ID
router.put('/pipelines/:id', authenticateToken, pipelineController.updatePipeline);

// Route to delete a specific pipeline by its ID
router.delete('/pipelines/:id', authenticateToken, pipelineController.deletePipeline);

// Route to get all pipelines
router.get('/pipelines', authenticateToken, pipelineController.getAllPipelines);

// Route to get pipeline data with deals by pipeline ID
router.get('/pipelines/:id/deals', authenticateToken, pipelineController.getPipelineDataWithDeals);

// Route to update stage
router.put('/pipelines/:dealId/update-stage', authenticateToken, pipelineController.updateDealStage);
module.exports = router;
