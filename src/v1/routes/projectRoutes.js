const express = require('express');
const projectController = require('../controller/projectController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/projects', authenticateToken, projectController.createProject);
router.get('/projects/:id', authenticateToken, projectController.getProjectById);
router.put('/projects/:id', authenticateToken, projectController.updateProject);
router.delete('/projects/:id', authenticateToken, projectController.deleteProject);
router.get('/projects', authenticateToken, projectController.getAllProjects);

module.exports = router;
