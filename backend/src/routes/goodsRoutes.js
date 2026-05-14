const express = require('express');
const router = express.Router();
const goodsController = require('../controllers/goodsController');
const authMiddleware = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// 公开路由（无需登录）
router.get('/', goodsController.getGoods);               // 物品列表/搜索
router.get('/:id', goodsController.getGoodsDetail);      // 物品详情

// 需要登录的路由
router.post('/', authMiddleware, upload, goodsController.createGoods);  // 发布物品（上传图片）
router.put('/:id', authMiddleware, upload, goodsController.updateGoods);        // 编辑物品（支持上传图片）
router.delete('/:id', authMiddleware, goodsController.deleteGoods);     // 下架物品
router.get('/my/list', authMiddleware, goodsController.getMyGoods);     // 我的发布
router.delete('/:id', authMiddleware, goodsController.deleteGoods);   //个人中心删除按钮
router.post('/upload', authMiddleware, goodsController.uploadSingle, goodsController.uploadImage);  // 单独上传图片

module.exports = router;