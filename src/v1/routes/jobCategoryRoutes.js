// Country Routes
const express = require('express');
const jobCategoryController = require('../controller/jobCategoryController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/job-category', authenticateToken, jobCategoryController.createJobCategory);
router.get('/job-category/:id', authenticateToken, jobCategoryController.findJobCategoryById);
router.put('/job-category/:id', authenticateToken, jobCategoryController.updateJobCategory);
router.delete('/job-category/:id', authenticateToken, jobCategoryController.deleteJobCategory);
router.get('/job-category', authenticateToken, jobCategoryController.getAllJobCategory);

module.exports = router;