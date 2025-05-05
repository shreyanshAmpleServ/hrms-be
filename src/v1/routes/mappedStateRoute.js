const express = require('express');
const stateController = require('../controller/mappedStateController');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Import the state controller
const router = express.Router();

// Get all states
router.get('/mapped-states', authenticateToken, stateController.getAllStates);

// Get state by ID
router.get('/mapped-states/:id', authenticateToken, stateController.getStateById);

// Create a new state
router.post('/mapped-states', authenticateToken, stateController.createState);

// Update an existing state
router.put('/mapped-states/:id', authenticateToken, stateController.updateState);

// Delete a state
router.delete('/mapped-states/:id', authenticateToken, stateController.deleteState);

module.exports = router;
