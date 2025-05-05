const express = require('express');
const companyController = require('../controller/companyMasterController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
    '/company',
    authenticateToken,
    companyController.createCompany
);

router.put(
    '/company/:id',
    authenticateToken,
    companyController.updateCompany
);

router.get('/company/:id', authenticateToken, companyController.getCompanyById);
router.get('/company', authenticateToken, companyController.getAllCompanies);
router.delete('/company/:id', authenticateToken, companyController.deleteCompany);

module.exports = router;
