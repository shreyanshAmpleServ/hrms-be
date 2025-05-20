const express = require('express');
const JobPostingController = require('../controller/JobPostingController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/job-posting', authenticateToken, JobPostingController.createJobPosting);
router.get('/job-posting/:id', authenticateToken, JobPostingController.findJobPostingById);
router.put('/job-posting/:id', authenticateToken, JobPostingController.updateJobPosting);
router.delete('/job-posting/:id', authenticateToken, JobPostingController.deleteJobPosting);
router.get('/job-posting', authenticateToken, JobPostingController.getAllJobPosting);

module.exports = router;
