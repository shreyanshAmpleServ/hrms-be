// Country Routes
const express = require('express');
const grievanceTypeController = require('../controller/grievanceTypeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/grievance-type', authenticateToken, grievanceTypeController.createGrievanceType);
router.get('/grievance-type/:id', authenticateToken, grievanceTypeController.findGrievanceTypeById);
router.put('/grievance-type/:id', authenticateToken, grievanceTypeController.updateGrievanceType);
router.delete('/grievance-type/:id', authenticateToken, grievanceTypeController.deleteGrievanceType);
router.get('/grievance-type', authenticateToken, grievanceTypeController.getAllGrievanceType);

module.exports = router;