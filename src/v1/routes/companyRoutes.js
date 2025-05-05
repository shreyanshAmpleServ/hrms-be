const express = require('express');
const companyController = require('../controller/companyController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Import upload middleware
const router = express.Router();
router.post(
  '/companies',
  authenticateToken,
  upload.single('logo'), // Use middleware for single file upload
  companyController.createCompany
);

router.put(
  '/companies/:id',
  authenticateToken,
 upload.single('logo'), // Use middleware for single file upload
  companyController.updateCompany
);


router.get('/companies/:id', authenticateToken, companyController.getCompanyById);
router.get('/companies', authenticateToken, companyController.getAllCompanies);
router.get('/companies/email', authenticateToken, companyController.getCompanyByEmail);
router.delete('/companies/:id', authenticateToken, companyController.deleteCompany);



module.exports = router;
