const express = require('express');
const { register, login,logout } = require('../controller/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, (req, res) => {
  res.success(null,req.user);
});

router.post('/logout', authenticateToken, logout); 

module.exports = router;
