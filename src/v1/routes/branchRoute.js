const express = require('express');
const branchController = require('../controller/branchController');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Import the branch controller
const router = express.Router();

// Get all branchs
router.get('/branch', authenticateToken, branchController.getAllBranch);

// Get branch by ID
router.get('/branch/:id', authenticateToken, branchController.getBranchById);

// Create a new branch
router.post('/branch', authenticateToken, branchController.createBranch);

// Update an existing branch
router.put('/branch/:id', authenticateToken, branchController.updateBranch);

// Delete a branch
router.delete('/branch/:id', authenticateToken, branchController.deleteBranch);

module.exports = router;
