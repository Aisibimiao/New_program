const express = require('express');
const router = express.Router();
const payController = require('../controllers/payController');
const authMiddleware = require('../middlewares/auth');

router.post('/wechat', authMiddleware, payController.createWechatPay);
router.post('/wechat/notify', payController.wechatNotify);
router.get('/order/:orderId', authMiddleware, payController.getOrderStatus);

module.exports = router;