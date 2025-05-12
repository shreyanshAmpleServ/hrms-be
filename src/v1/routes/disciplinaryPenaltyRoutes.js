// Country Routes
const express = require('express');
const disciplinaryPenaltyController = require('../controller/disciplinaryPenaltyController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/disciplinary-penalty', authenticateToken, disciplinaryPenaltyController.createDisciplinaryPenalty);
router.get('/disciplinary-penalty/:id', authenticateToken, disciplinaryPenaltyController.findDisciplinaryPenaltyById);
router.put('/disciplinary-penalty/:id', authenticateToken, disciplinaryPenaltyController.updateDisciplinaryPenalty);
router.delete('/disciplinary-penalty/:id', authenticateToken, disciplinaryPenaltyController.deleteDisciplinaryPenalty);
router.get('/disciplinary-penalty', authenticateToken, disciplinaryPenaltyController.getAllDisciplinaryPenalty);

module.exports = router;