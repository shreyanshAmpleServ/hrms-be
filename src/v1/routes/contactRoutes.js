const express = require('express');
const contactController= require('../controller/contactController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/contacts', authenticateToken,upload.single('image'), contactController.createContact);
router.get('/contacts/:id', authenticateToken, contactController.getContactById);
router.put('/contacts/:id', authenticateToken,upload.single('image'), contactController.updateContact);
router.delete('/contacts/:id', authenticateToken, contactController.deleteContact);
router.get('/contacts', authenticateToken, contactController.getAllContacts);


module.exports = router;
