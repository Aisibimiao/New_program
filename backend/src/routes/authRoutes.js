const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');
const uploadAvatar = require('../middlewares/uploadAvatar');

// 公开路由
router.post('/send-register-code', authController.sendRegisterCode);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-reset-code', authController.sendResetCode);
router.post('/reset-password', authController.resetPassword);

// 需要登录的路由
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/avatar', authMiddleware, uploadAvatar, authController.uploadAvatar);

module.exports = router;