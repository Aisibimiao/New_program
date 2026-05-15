const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createReport = async (req, res) => {
    try {
        const { reportedUserId, goodsId, reason, description } = req.body;
        const reporterId = req.user.id;

        if (!reason) {
            return res.status(400).json({ msg: '请选择举报原因' });
        }

        if (!reportedUserId && !goodsId) {
            return res.status(400).json({ msg: '请提供被举报对象' });
        }

        const report = await prisma.$queryRaw`
            INSERT INTO Report (id, reporterId, reportedUserId, goodsId, reason, description, status)
            VALUES (UUID(), ${reporterId}, ${reportedUserId || null}, ${goodsId || null}, ${reason}, ${description || null}, 'PENDING')
        `;

        res.json({ msg: '举报成功，我们会尽快处理' });
    } catch (err) {
        console.error('创建举报失败:', err);
        res.status(500).json({ msg: '举报失败' });
    }
};

exports.getReportList = async (req, res) => {
    try {
        const { status, page = 1, pageSize = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(pageSize);

        let where = '';
        const params = [];

        if (status) {
            where = 'WHERE status = ?';
            params.push(status);
        }

        const countResult = await prisma.$queryRaw`
            SELECT COUNT(*) as total FROM Report ${prisma.$queryRaw(where, ...params)}
        `;
        const total = countResult[0]?.total || 0;

        const reports = await prisma.$queryRaw`
            SELECT r.*,
                   reporter.nickname as reporterNickname,
                   reportedUser.nickname as reportedUserNickname,
                   goods.title as goodsTitle
            FROM Report r
            LEFT JOIN User reporter ON r.reporterId = reporter.id
            LEFT JOIN User reportedUser ON r.reportedUserId = reportedUser.id
            LEFT JOIN Goods goods ON r.goodsId = goods.id
            ${status ? prisma.$queryRaw`WHERE r.status = ${status}` : prisma.$queryRaw``}
            ORDER BY r.createdAt DESC
            LIMIT ${skip} OFFSET ${parseInt(pageSize)}
        `;

        res.json({
            msg: '获取成功',
            reports: reports.map(r => ({
                id: r.id,
                reason: r.reason,
                description: r.description,
                status: r.status,
                handleResult: r.handleResult,
                createdAt: r.createdAt,
                reporter: { id: r.reporterId, nickname: r.reporterNickname },
                reportedUser: r.reportedUserId ? { id: r.reportedUserId, nickname: r.reportedUserNickname } : null,
                goods: r.goodsId ? { id: r.goodsId, title: r.goodsTitle } : null
            })),
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        });
    } catch (err) {
        console.error('获取举报列表失败:', err);
        res.status(500).json({ msg: '获取失败' });
    }
};

exports.handleReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, handleResult } = req.body;

        if (!['RESOLVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ msg: '状态不正确' });
        }

        await prisma.$queryRaw`
            UPDATE Report
            SET status = ${status}, handleResult = ${handleResult || null}, updatedAt = NOW(3)
            WHERE id = ${reportId}
        `;

        res.json({ msg: '处理成功' });
    } catch (err) {
        console.error('处理举报失败:', err);
        res.status(500).json({ msg: '处理失败' });
    }
};

exports.getUserSettings = async (req, res) => {
    try {
        const { userId } = req.params;

        const settings = await prisma.$queryRaw`
            SELECT * FROM UserSettings WHERE userId = ${userId}
        `;

        if (settings.length === 0) {
            return res.json({
                msg: '获取成功',
                settings: {
                    isMuted: false,
                    isBlocked: false,
                    muteUntil: null
                }
            });
        }

        res.json({
            msg: '获取成功',
            settings: {
                isMuted: settings[0].isMuted || false,
                isBlocked: settings[0].isBlocked || false,
                muteUntil: settings[0].muteUntil
            }
        });
    } catch (err) {
        console.error('获取用户设置失败:', err);
        res.status(500).json({ msg: '获取失败' });
    }
};

exports.updateUserSettings = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isMuted, isBlocked, muteUntil } = req.body;

        const existing = await prisma.$queryRaw`
            SELECT id FROM UserSettings WHERE userId = ${userId}
        `;

        if (existing.length === 0) {
            await prisma.$queryRaw`
                INSERT INTO UserSettings (id, userId, isMuted, isBlocked, muteUntil)
                VALUES (UUID(), ${userId}, ${isMuted || false}, ${isBlocked || false}, ${muteUntil || null})
            `;
        } else {
            await prisma.$queryRaw`
                UPDATE UserSettings
                SET isMuted = ${isMuted !== undefined ? isMuted : false},
                    isBlocked = ${isBlocked !== undefined ? isBlocked : false},
                    muteUntil = ${muteUntil || null},
                    updatedAt = NOW(3)
                WHERE userId = ${userId}
            `;
        }

        res.json({ msg: '更新成功' });
    } catch (err) {
        console.error('更新用户设置失败:', err);
        res.status(500).json({ msg: '更新失败' });
    }
};