const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

router.post('/', authMiddleware, reportController.createReport);
router.get('/list', authMiddleware, adminController.isAdmin, reportController.getReportList);
router.put('/:reportId/handle', authMiddleware, adminController.isAdmin, reportController.handleReport);

module.exports = router;