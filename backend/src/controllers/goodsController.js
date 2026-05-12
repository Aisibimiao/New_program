const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

const categoryMap = {
    '数码产品': 'ELECTRONICS',
    '图书教材': 'BOOK',
    '服饰鞋包': 'CLOTHING',
    '运动户外': 'SPORTS',
    '生活用品': 'LIFE',
    '其他': 'OTHER',
    'ELECTRONICS': 'ELECTRONICS',
    'BOOK': 'BOOK',
    'CLOTHING': 'CLOTHING',
    'SPORTS': 'SPORTS',
    'LIFE': 'LIFE',
    'OTHER': 'OTHER'
};

function getCategoryEnum(category) {
    return categoryMap[category] || category;
}

// 获取所有在售物品（分页 + 搜索）
exports.getGoods = async (req, res) => {
    try {
        const { keyword, category, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {
            status: 'ACTIVE'
        };

        if (keyword) {
            where.OR = [
                { title: { contains: keyword } },
                { description: { contains: keyword } }
            ];
        }
        if (category && category !== 'ALL') {
            where.category = getCategoryEnum(category);
        }

        const [goods, total] = await Promise.all([
            prisma.goods.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    seller: {
                        select: { id: true, nickname: true, name: true, avatar: true }
                    }
                }
            }),
            prisma.goods.count({ where })
        ]);

        const list = goods.map(g => ({
            id: g.id,
            name: g.title,
            description: g.description,
            price: parseFloat(g.price),
            originalPrice: g.originalPrice ? parseFloat(g.originalPrice) : 0,
            images: typeof g.images === 'string' ? JSON.parse(g.images) : (g.images || []),
            category: g.category,
            condition: 2,
            status: g.status === 'ACTIVE' ? 1 : 0,
            userId: g.sellerId,
            createdAt: g.createdAt,
            updatedAt: g.updatedAt
        }));

        res.json({ list, total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '获取物品列表失败' });
    }
};

// 获取单个物品详情
exports.getGoodsDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const goods = await prisma.goods.findUnique({
            where: { id },
            include: {
                seller: {
                    select: { id: true, nickname: true, name: true, avatar: true, email: true }
                }
            }
        });
        if (!goods) {
            return res.status(404).json({ msg: '物品不存在' });
        }
        await prisma.goods.update({
            where: { id },
            data: { viewCount: { increment: 1 } }
        });

        res.json({
            id: goods.id,
            name: goods.title,
            description: goods.description,
            price: parseFloat(goods.price),
            originalPrice: goods.originalPrice ? parseFloat(goods.originalPrice) : 0,
            images: typeof goods.images === 'string' ? JSON.parse(goods.images) : (goods.images || []),
            category: goods.category,
            condition: 2,
            status: goods.status === 'ACTIVE' ? 1 : 0,
            userId: goods.sellerId,
            createdAt: goods.createdAt,
            updatedAt: goods.updatedAt,
            seller: goods.seller
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '获取详情失败' });
    }
};

// 发布物品（需要登录）
exports.createGoods = async (req, res) => {
    try {
        const { name, title, description, price, originalPrice, category, condition, images } = req.body;
        const sellerId = req.user.id;

        const goodsTitle = name || title;
        if (!goodsTitle || !price || !category) {
            return res.status(400).json({ msg: '请填写标题、价格和分类' });
        }

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        } else if (images && Array.isArray(images)) {
            imageUrls = images;
        }

        const goods = await prisma.goods.create({
            data: {
                title: goodsTitle,
                description: description || '',
                price: parseFloat(price),
                originalPrice: parseFloat(originalPrice) || 0,
                category,
                condition: condition || 2,
                images: imageUrls,
                sellerId,
                status: 'ACTIVE'
            }
        });

        res.status(201).json({ msg: '发布成功', goods });
    } catch (err) {
        console.error(err);
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, () => { });
            });
        }
        res.status(500).json({ msg: '发布失败' });
    }
};

// 编辑物品（只能编辑自己的物品）
exports.updateGoods = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, category, location, status } = req.body;
        const userId = req.user.id;

        const existing = await prisma.goods.findFirst({
            where: { id, sellerId: userId }
        });
        if (!existing) {
            return res.status(403).json({ msg: '无权修改此物品' });
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (price) updateData.price = parseFloat(price);
        if (category) updateData.category = category;
        if (location !== undefined) updateData.location = location;
        if (contact !== undefined) updateData.contact = contact;
        if (status) updateData.status = status;

        const updated = await prisma.goods.update({
            where: { id },
            data: updateData
        });
        res.json({ msg: '更新成功', goods: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '更新失败' });
    }
};

// 下架物品（软删除：改为 INACTIVE）
exports.deleteGoods = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const existing = await prisma.goods.findFirst({
            where: { id, sellerId: userId }
        });
        if (!existing) {
            return res.status(403).json({ msg: '无权删除此物品' });
        }

        await prisma.goods.update({
            where: { id },
            data: { status: 'INACTIVE' }
        });
        res.json({ msg: '已下架' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '下架失败' });
    }
};

// 获取当前用户发布的物品（我的发布）
exports.getMyGoods = async (req, res) => {
    try {
        const userId = req.user.id;
        const goods = await prisma.goods.findMany({
            where: { sellerId: userId },
            orderBy: { createdAt: 'desc' }
        });
        const list = goods.map(g => ({
            id: g.id,
            name: g.title,
            description: g.description,
            price: parseFloat(g.price),
            originalPrice: g.originalPrice ? parseFloat(g.originalPrice) : 0,
            images: typeof g.images === 'string' ? JSON.parse(g.images) : (g.images || []),
            category: g.category,
            condition: 2,
            status: g.status === 'ACTIVE' ? 1 : 0,
            userId: g.sellerId,
            createdAt: g.createdAt,
            updatedAt: g.updatedAt
        }));
        res.json(list);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '获取失败' });
    }
};

// 物理删除物品（仅限卖家或管理员）
exports.deleteGoods = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const goods = await prisma.goods.findUnique({
            where: { id }
        });

        if (!goods) {
            return res.status(404).json({ msg: '物品不存在' });
        }

        // 只有卖家或管理员可以删除
        if (goods.sellerId !== userId && userRole !== 'ADMIN') {
            return res.status(403).json({ msg: '无权删除此物品' });
        }

        await prisma.goods.delete({
            where: { id }
        });

        res.json({ msg: '删除成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '删除失败' });
    }
};