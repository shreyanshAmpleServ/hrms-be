const express = require('express');
const EmploymentContractController = require('../controller/EmploymentContractController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/UploadFileMiddleware');

const router = express.Router();

router.post('/employment-contract', authenticateToken,upload.single('document_path'), EmploymentContractController.createEmploymentContract);
router.get('/employment-contract/:id', authenticateToken, EmploymentContractController.findEmploymentContractById);
router.put('/employment-contract/:id', authenticateToken, EmploymentContractController.updateEmploymentContract);
router.delete('/employment-contract/:id', authenticateToken, EmploymentContractController.deleteEmploymentContract);
router.get('/employment-contract', authenticateToken, EmploymentContractController.getAllEmploymentContract);

module.exports = router;
