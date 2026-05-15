const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const APP_ID = process.env.WECHAT_APP_ID || 'wx3d1487d7bde93a4f';
const MCH_ID = process.env.WECHAT_MCH_ID || '1234567890';
const API_KEY = process.env.WECHAT_API_KEY || 'your-api-key-here';
const NOTIFY_URL = process.env.WECHAT_NOTIFY_URL || 'http://localhost:3000/api/pay/wechat/notify';

function generateSign(params) {
    const sortedKeys = Object.keys(params).sort();
    const signStr = sortedKeys.map(key => `${key}=${params[key]}`).join('&') + `&key=${API_KEY}`;
    return crypto.createHash('md5').update(signStr, 'utf8').digest('hex').toUpperCase();
}

async function unifiedOrder(outTradeNo, totalFee, description, openid) {
    const nonceStr = crypto.randomBytes(16).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const params = {
        appid: APP_ID,
        mch_id: MCH_ID,
        nonce_str: nonceStr,
        body: description.substring(0, 128),
        out_trade_no: outTradeNo,
        total_fee: totalFee,
        spbill_create_ip: '127.0.0.1',
        notify_url: NOTIFY_URL,
        trade_type: 'JSAPI',
        openid: openid
    };

    params.sign = generateSign(params);

    const xml = `<xml>${Object.entries(params).map(([key, value]) => `<${key}><![CDATA[${value}]]></${key}>`).join('')}</xml>`;

    try {
        const response = await axios.post('https://api.mch.weixin.qq.com/pay/unifiedorder', xml, {
            headers: { 'Content-Type': 'text/xml' }
        });

        const result = {};
        const matches = response.data.match(/<(\w+)><!\[CDATA\[([^\]]+)\]\]><\/\1>|<(\w+)>([^<]+)<\/\3>/g);
        if (matches) {
            matches.forEach(match => {
                const cdataMatch = match.match(/<(\w+)><!\[CDATA\[([^\]]+)\]\]><\/\1>/);
                const textMatch = match.match(/<(\w+)>([^<]+)<\/\1>/);
                if (cdataMatch) {
                    result[cdataMatch[1]] = cdataMatch[2];
                } else if (textMatch) {
                    result[textMatch[1]] = textMatch[2];
                }
            });
        }

        return { success: result.return_code === 'SUCCESS', result };
    } catch (error) {
        console.error('微信支付统一下单失败:', error);
        return { success: false, error: error.message };
    }
}

function generateAppPayParams(prepayId) {
    const nonceStr = crypto.randomBytes(16).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const params = {
        appId: APP_ID,
        timeStamp: timestamp,
        nonceStr: nonceStr,
        package: `prepay_id=${prepayId}`,
        signType: 'MD5'
    };

    params.paySign = generateSign(params);

    return {
        ...params,
        timestamp
    };
}

exports.createWechatPay = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.id;
        const userOpenid = req.user.openid;

        if (!orderId) {
            return res.status(400).json({ msg: '请选择订单' });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { goods: true, buyer: true }
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

        const outTradeNo = `ORDER_${orderId}_${Date.now()}`;
        const totalFee = Math.round(order.goods.price * 100);
        const description = order.goods.name || order.goods.title;

        const { success, result, error } = await unifiedOrder(outTradeNo, totalFee, description, userOpenid);

        if (!success || result.return_code !== 'SUCCESS') {
            console.error('统一下单失败:', result?.return_msg || error);
            return res.status(400).json({ msg: '支付发起失败', detail: result?.return_msg || error });
        }

        const prepayId = result.prepay_id;
        const payParams = generateAppPayParams(prepayId);

        await prisma.order.update({
            where: { id: orderId },
            data: { contactInfo: JSON.stringify({ outTradeNo, payMethod: 'wechat' }) }
        });

        res.json({
            msg: '支付参数获取成功',
            payData: payParams,
            orderId: orderId
        });
    } catch (err) {
        console.error('创建支付订单失败:', err);
        res.status(500).json({ msg: '支付发起失败' });
    }
};

exports.wechatNotify = async (req, res) => {
    try {
        let xmlData = '';
        req.setEncoding('utf8');
        req.on('data', chunk => { xmlData += chunk; });
        req.on('end', async () => {
            try {
                const result = {};
                const matches = xmlData.match(/<(\w+)><!\[CDATA\[([^\]]+)\]\]><\/\1>|<(\w+)>([^<]+)<\/\3>/g);
                if (matches) {
                    matches.forEach(match => {
                        const cdataMatch = match.match(/<(\w+)><!\[CDATA\[([^\]]+)\]\]><\/\1>/);
                        const textMatch = match.match(/<(\w+)>([^<]+)<\/\1>/);
                        if (cdataMatch) {
                            result[cdataMatch[1]] = cdataMatch[2];
                        } else if (textMatch) {
                            result[textMatch[1]] = textMatch[2];
                        }
                    });
                }

                if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
                    const outTradeNo = result.out_trade_no;
                    const orderIdMatch = outTradeNo.match(/ORDER_(.+?)_\d+/);
                    if (orderIdMatch) {
                        const orderId = orderIdMatch[1];
                        await prisma.order.update({
                            where: { id: orderId },
                            data: { status: 'PAID' }
                        });
                    }
                    res.xml('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
                } else {
                    res.xml('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[处理失败]]></return_msg></xml>');
                }
            } catch (err) {
                console.error('支付回调处理失败:', err);
                res.xml('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[处理异常]]></return_msg></xml>');
            }
        });
    } catch (err) {
        console.error('支付回调处理失败:', err);
        res.status(500).json({ msg: '处理失败' });
    }
};

exports.getOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { goods: true, buyer: true, seller: true }
        });

        if (!order) {
            return res.status(404).json({ msg: '订单不存在' });
        }

        if (order.buyerId !== userId && order.sellerId !== userId) {
            return res.status(403).json({ msg: '无权查看此订单' });
        }

        res.json({
            msg: '查询成功',
            order: {
                id: order.id,
                status: order.status,
                goods: {
                    id: order.goods.id,
                    title: order.goods.title,
                    price: order.goods.price,
                    images: order.goods.images
                },
                buyer: {
                    id: order.buyer.id,
                    nickname: order.buyer.nickname,
                    avatar: order.buyer.avatar
                },
                seller: {
                    id: order.seller.id,
                    nickname: order.seller.nickname,
                    avatar: order.seller.avatar
                },
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }
        });
    } catch (err) {
        console.error('查询订单状态失败:', err);
        res.status(500).json({ msg: '查询失败' });
    }
};