const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createWechatPay = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.id;

        if (!orderId) {
            return res.status(400).json({ msg: '请选择订单' });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { goods: true }
        });

        if (!order) {
            return res.status(404).json({ msg: '订单不存在' });
        }

        if (order.buyerId !== userId) {
            return res.status(403).json({ msg: '无权操作此订单' });
        }

        if (order.status !== 'PENDING') {
            return res.status(400).json({ msg: '订单状态不支持支付' });
        }

        const totalFee = Math.round(order.goods.price * 100);

        const payData = {
            appid: 'wx1234567890123456',
            partnerid: '1234567890',
            prepayid: `wx_prepay_${Date.now()}`,
            noncestr: Math.random().toString(36).substring(2, 15),
            timestamp: Math.floor(Date.now() / 1000).toString(),
            package: 'Sign=WXPay',
            sign: 'abcdefghijklmnopqrstuvwxyz123456'
        };

        await prisma.order.update({
            where: { id: orderId },
            data: { 
                status: 'COMPLETED',
                contactInfo: JSON.stringify({ payMethod: 'wechat' })
            }
        });

        await prisma.goods.update({
            where: { id: order.goodsId },
            data: { status: 'SOLD' }
        });

        res.json({
            msg: '支付成功',
            payData,
            order: {
                ...order,
                status: 'COMPLETED'
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '支付失败' });
    }
};

exports.wechatNotify = async (req, res) => {
    try {
        const { orderId, resultCode } = req.body;
        
        if (resultCode === 'SUCCESS') {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'COMPLETED' }
            });
        }
        
        res.json({ return_code: 'SUCCESS', return_msg: 'OK' });
    } catch (err) {
        console.error(err);
        res.json({ return_code: 'FAIL', return_msg: '处理失败' });
    }
};