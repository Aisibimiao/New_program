const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/roleCheck');

// 所有管理员路由都需要先认证，再检查角色
router.use(authMiddleware);
router.use(adminOnly);

router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);
router.get('/goods', adminController.getAllGoods);
router.put('/goods/:goodsId/status', adminController.updateGoodsStatus);
router.delete('/goods/:goodsId', adminController.deleteGoods);
router.get('/stats', adminController.getStats);
router.get('/trade-stats', adminController.getTradeStats);

module.exports = router;