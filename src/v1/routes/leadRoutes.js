const express = require('express');
const leadController = require('../controller/leadController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Import the upload middleware
const router = express.Router();

// Create a new lead
router.post(
  '/leads',
  authenticateToken,

  upload.single('company_icon'), // Use middleware for single file upload (company_icon)
  leadController.createLead
);

// Update an existing lead
router.put(
  '/leads/:id',
  authenticateToken,
  upload.single('company_icon'), // Use middleware for single file upload (company_icon)
  leadController.updateLead
);

// Get lead by ID
router.get('/leads/:id', authenticateToken, leadController.getLeadById);

// Get all leads
router.get('/leads', authenticateToken, leadController.getAllLeads);
// Get all lead status with their leads 
router.get('/lead-statuses', authenticateToken, leadController.getAllLeadsGroupedByLostReasons);

// Delete a lead
router.delete('/leads/:id', authenticateToken, leadController.deleteLead);

module.exports = router;
