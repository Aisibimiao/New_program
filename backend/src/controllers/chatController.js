const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMessages = async (req, res) => {
    try {
        const { goodsId, otherId } = req.query;
        const userId = req.user.id;

        if (!goodsId || !otherId) {
            return res.status(400).json({ msg: '参数错误' });
        }

        const messages = await prisma.chatMessage.findMany({
            where: {
                goodsId,
                OR: [
                    { senderId: userId, receiverId: otherId },
                    { senderId: otherId, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json({ data: messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '获取消息失败' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { goodsId, receiverId, content } = req.body;
        const senderId = req.user.id;

        if (!goodsId || !receiverId || !content) {
            return res.status(400).json({ msg: '参数错误' });
        }

        const goods = await prisma.goods.findUnique({ where: { id: goodsId } });
        if (!goods) {
            return res.status(404).json({ msg: '商品不存在' });
        }

        const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
        if (!receiver) {
            return res.status(404).json({ msg: '接收方不存在' });
        }

        const message = await prisma.chatMessage.create({
            data: {
                senderId,
                receiverId,
                goodsId,
                content
            }
        });

        res.json({ msg: '发送成功', message });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '发送失败' });
    }
};

exports.getChatList = async (req, res) => {
    try {
        const userId = req.user.id;

        const messages = await prisma.chatMessage.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                goods: true
            },
            orderBy: { createdAt: 'desc' },
            distinct: ['goodsId']
        });

        const chatList = [];
        const processedGoodsIds = new Set();

        for (const msg of messages) {
            if (processedGoodsIds.has(msg.goodsId)) continue;
            processedGoodsIds.add(msg.goodsId);

            const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            const other = await prisma.user.findUnique({ where: { id: otherId } });

            chatList.push({
                id: msg.goodsId,
                goodsId: msg.goodsId,
                goodsName: msg.goods.title,
                goodsImage: msg.goods.images?.[0] || '',
                lastMessage: msg.content,
                lastTime: msg.createdAt,
                otherId: otherId,
                otherName: other?.nickname || other?.name || '用户',
                otherAvatar: other?.avatar || ''
            });
        }

        res.json({ data: chatList });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '获取聊天列表失败' });
    }
};