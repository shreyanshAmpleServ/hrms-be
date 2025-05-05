const express = require('express');
const userController = require('../controller/userControlle');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');



const router = express.Router();


router.post('/users',authenticateToken ,upload.single('profile_img'), userController.createUser); // Create a new user
router.get('/users/:id', authenticateToken,userController.getUserById); // Get user by ID
router.get('/users/email/:email',authenticateToken ,userController.getUserByEmail); // Get user by email
router.put('/users/:id',authenticateToken ,upload.single('profile_img'), userController.updateUser); // Update user by ID
router.delete('/users/:id',authenticateToken ,userController.deleteUser); // Delete user by ID
router.get('/users', authenticateToken,userController.getAllUsers); // Get all users
router.get('/userByToken', authenticateToken,userController.getUserByToken); // Get users by token

module.exports = router;
