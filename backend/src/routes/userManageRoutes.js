const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

router.get('/:userId/settings', authMiddleware, adminController.isAdmin, reportController.getUserSettings);
router.put('/:userId/settings', authMiddleware, adminController.isAdmin, reportController.updateUserSettings);

module.exports = router;