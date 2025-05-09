// Country Routes
const express = require('express');
const KPIController = require('../controller/KPIController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/kpi', authenticateToken, KPIController.createKPI);
router.get('/kpi/:id', authenticateToken, KPIController.findKPIById);
router.put('/kpi/:id', authenticateToken, KPIController.updateKPI);
router.delete('/kpi/:id', authenticateToken, KPIController.deleteKPI);
router.get('/kpi', authenticateToken, KPIController.getAllKPI);

module.exports = router;