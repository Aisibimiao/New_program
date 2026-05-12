const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/auth');

// 所有订单接口都需要登录
router.post('/', authMiddleware, orderController.createOrder);
router.put('/:orderId/confirm', authMiddleware, orderController.confirmOrder);
router.put('/:orderId/cancel', authMiddleware, orderController.cancelOrder);
router.delete('/:orderId', authMiddleware, orderController.deleteOrder);
router.get('/buy', authMiddleware, orderController.getBuyOrders);
router.get('/sell', authMiddleware, orderController.getSellOrders);
router.get('/:orderId', authMiddleware, orderController.getOrderDetail);

module.exports = router;