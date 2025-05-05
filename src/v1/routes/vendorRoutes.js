const express = require('express');
const vendorController = require('../controller/vendorControlle');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');



const router = express.Router();


router.post('/vendor',authenticateToken ,upload.single('profile_img'), vendorController.createVendor); // Create a new user
router.get('/vendor/:id', authenticateToken,vendorController.findVendorById); // Get user by ID
router.get('/vendor/email/:email',authenticateToken ,vendorController.getUserByEmail); // Get user by email
router.put('/vendor/:id',authenticateToken ,upload.single('profile_img'), vendorController.updateVendor); // Update user by ID
router.delete('/vendor/:id',authenticateToken ,vendorController.deleteVendor); // Delete user by ID
router.get('/vendor', authenticateToken,vendorController.getAllVendors); // Get all users

module.exports = router;
