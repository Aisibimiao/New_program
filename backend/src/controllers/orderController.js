const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 买家下单（创建订单）
exports.createOrder = async (req, res) => {
    try {
        const { goodsId, contactInfo } = req.body;
        const buyerId = req.user.id;

        if (!goodsId) {
            return res.status(400).json({ msg: '请选择物品' });
        }

        const goods = await prisma.goods.findUnique({
            where: { id: goodsId },
            include: { seller: true }
        });
        if (!goods || goods.status !== 'ACTIVE') {
            return res.status(400).json({ msg: '物品不存在或已下架' });
        }
        if (goods.sellerId === buyerId) {
            return res.status(400).json({ msg: '不能购买自己的物品' });
        }

        const order = await prisma.order.create({
            data: {
                buyerId,
                goodsId,
                contactInfo: contactInfo || null,
                status: 'PENDING'
            },
            include: {
                goods: true,
                buyer: { select: { id: true, name: true, phone: true, email: true } }
            }
        });
        res.status(201).json({ msg: '下单成功，请等待卖家联系', order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '下单失败' });
    }
};

// 卖家确认订单
exports.confirmOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const sellerId = req.user.id;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { goods: true }
        });
        if (!order) {
            return res.status(404).json({ msg: '订单不存在' });
        }
        if (order.goods.sellerId !== sellerId) {
            return res.status(403).json({ msg: '无权操作此订单' });
        }
        if (order.status !== 'PENDING') {
            return res.status(400).json({ msg: '订单状态无法确认' });
        }

        await prisma.$transaction([
            prisma.order.update({
                where: { id: orderId },
                data: { status: 'COMPLETED' }
            }),
            prisma.goods.update({
                where: { id: order.goodsId },
                data: { status: 'SOLD' }
            })
        ]);
        res.json({ msg: '交易已完成' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '操作失败' });
    }
};

// 取消订单
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { goods: true }
        });
        if (!order) {
            return res.status(404).json({ msg: '订单不存在' });
        }
        if (order.buyerId !== userId && order.goods.sellerId !== userId) {
            return res.status(403).json({ msg: '无权操作' });
        }
        if (order.status !== 'PENDING') {
            return res.status(400).json({ msg: '订单已完成或已取消，无法取消' });
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' }
        });
        res.json({ msg: '订单已取消' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '取消失败' });
    }
};

// 删除订单（仅限已完成或已取消的订单）
exports.deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { goods: true }
        });

        if (!order) {
            return res.status(404).json({ msg: '订单不存在' });
        }

        if (order.buyerId !== userId && order.goods.sellerId !== userId) {
            return res.status(403).json({ msg: '无权删除此订单' });
        }

        if (order.status !== 'COMPLETED' && order.status !== 'CANCELLED') {
            return res.status(400).json({ msg: '只能删除已完成或已取消的订单' });
        }

        await prisma.order.delete({
            where: { id: orderId }
        });

        res.json({ msg: '订单已删除' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '删除失败' });
    }
};

// 获取我买到的订单
exports.getBuyOrders = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const orders = await prisma.order.findMany({
            where: { buyerId },
            include: {
                goods: {
                    include: { seller: { select: { id: true, name: true, phone: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const result = orders.map(order => ({
            ...order,
            goods: {
                ...order.goods,
                price: parseFloat(order.goods.price),
                originalPrice: order.goods.originalPrice ? parseFloat(order.goods.originalPrice) : 0,
                images: typeof order.goods.images === 'string' ? JSON.parse(order.goods.images) : (order.goods.images || [])
            }
        }));
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '获取订单失败' });
    }
};

// 获取我卖出的订单
exports.getSellOrders = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const orders = await prisma.order.findMany({
            where: { goods: { sellerId } },
            include: {
                goods: true,
                buyer: { select: { id: true, name: true, phone: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        const result = orders.map(order => ({
            ...order,
            goods: {
                ...order.goods,
                price: parseFloat(order.goods.price),
                originalPrice: order.goods.originalPrice ? parseFloat(order.goods.originalPrice) : 0,
                images: typeof order.goods.images === 'string' ? JSON.parse(order.goods.images) : (order.goods.images || [])
            }
        }));
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '获取订单失败' });
    }
};

// 获取订单详情
exports.getOrderDetail = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                goods: {
                    include: {
                        seller: { select: { id: true, name: true, nickname: true, avatar: true, role: true } }
                    }
                },
                buyer: { select: { id: true, name: true, nickname: true, avatar: true, role: true } }
            }
        });

        if (!order) {
            return res.status(404).json({ msg: '订单不存在' });
        }

        if (order.buyerId !== userId && order.goods.sellerId !== userId) {
            return res.status(403).json({ msg: '无权查看此订单' });
        }

        const result = {
            ...order,
            goods: {
                ...order.goods,
                price: parseFloat(order.goods.price),
                originalPrice: order.goods.originalPrice ? parseFloat(order.goods.originalPrice) : 0,
                images: typeof order.goods.images === 'string' ? JSON.parse(order.goods.images) : (order.goods.images || [])
            }
        };

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '获取订单详情失败' });
    }
};