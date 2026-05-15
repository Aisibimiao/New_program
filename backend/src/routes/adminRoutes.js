const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/auth');

// 所有管理员路由都需要先认证，再检查角色
router.use(authMiddleware);
router.use(adminController.isAdmin);

router.get('/list', adminController.getAdminList);
router.post('/add', adminController.addAdmin);
router.delete('/remove/:userId', adminController.removeAdmin);
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/status', adminController.toggleUserStatus);
router.get('/stats', async (req, res) => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
        const [userCount, goodsCount, orderCount] = await Promise.all([
            prisma.user.count(),
            prisma.goods.count(),
            prisma.order.count()
        ]);
        res.json({
            msg: '获取成功',
            stats: { userCount, goodsCount, orderCount }
        });
    } catch (err) {
        res.status(500).json({ msg: '获取失败' });
    }
});

module.exports = router;