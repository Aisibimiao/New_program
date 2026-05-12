const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addFavorite = async (req, res) => {
    try {
        const { goodsId } = req.body;
        const userId = req.user.id;

        if (!goodsId) {
            return res.status(400).json({ msg: '请选择商品' });
        }

        const goods = await prisma.goods.findUnique({ where: { id: goodsId } });
        if (!goods) {
            return res.status(404).json({ msg: '商品不存在' });
        }

        const existing = await prisma.favorite.findFirst({
            where: { userId, goodsId }
        });
        if (existing) {
            return res.status(400).json({ msg: '已收藏该商品' });
        }

        await prisma.favorite.create({
            data: { userId, goodsId }
        });

        res.json({ msg: '收藏成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '收藏失败' });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        const { goodsId } = req.params;
        const userId = req.user.id;

        const favorite = await prisma.favorite.findFirst({
            where: { userId, goodsId }
        });
        if (!favorite) {
            return res.status(404).json({ msg: '未收藏该商品' });
        }

        await prisma.favorite.delete({
            where: { id: favorite.id }
        });

        res.json({ msg: '取消收藏成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '取消收藏失败' });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                goods: {
                    include: {
                        seller: { select: { id: true, nickname: true, name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const result = favorites.map(fav => ({
            id: fav.id,
            goodsId: fav.goodsId,
            userId: fav.userId,
            createdAt: fav.createdAt,
            goods: {
                id: fav.goods.id,
                name: fav.goods.title,
                description: fav.goods.description,
                price: parseFloat(fav.goods.price),
                originalPrice: fav.goods.originalPrice ? parseFloat(fav.goods.originalPrice) : 0,
                images: fav.goods.images || [],
                category: fav.goods.category,
                condition: fav.goods.condition || 2,
                status: fav.goods.status === 'ACTIVE' ? 1 : 0,
                userId: fav.goods.sellerId,
                createdAt: fav.goods.createdAt,
                updatedAt: fav.goods.updatedAt
            }
        }));

        res.json({ data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '获取收藏失败' });
    }
};