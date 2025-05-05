const express = require('express');
const activitiesController = require('../controller/activitesController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/activities', authenticateToken, activitiesController.createActivitiesStatus);
// router.get('/activities/:id', authenticateToken, activitiesController.getCallStatusById);
router.put('/activities/:id', authenticateToken, activitiesController.updateActivities);
router.delete('/activities/:id', authenticateToken, activitiesController.deleteActivities);
router.get('/activities', authenticateToken, activitiesController.getAllActivitiesStatuses);
router.get('/grouped-activities', authenticateToken, activitiesController.getGroupActivities);

router.get('/activityTypes', authenticateToken, activitiesController.getActivitiesTypes);

module.exports = router;
