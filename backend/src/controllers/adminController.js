const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.isAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const admin = await prisma.admin.findUnique({
            where: { userId }
        });

        if (!admin) {
            return res.status(403).json({ msg: '无管理员权限' });
        }

        req.admin = admin;
        next();
    } catch (err) {
        console.error('检查管理员权限失败:', err);
        res.status(500).json({ msg: '权限校验失败' });
    }
};

exports.getAdminList = async (req, res) => {
    try {
        const admins = await prisma.admin.findMany({
            include: { user: true }
        });

        res.json({
            msg: '获取成功',
            admins: admins.map(admin => ({
                id: admin.id,
                userId: admin.userId,
                role: admin.role,
                permissions: admin.permissions,
                user: {
                    id: admin.user.id,
                    nickname: admin.user.nickname,
                    avatar: admin.user.avatar,
                    phone: admin.user.phone
                }
            }))
        });
    } catch (err) {
        console.error('获取管理员列表失败:', err);
        res.status(500).json({ msg: '获取失败' });
    }
};

exports.addAdmin = async (req, res) => {
    try {
        const { userId, permissions } = req.body;

        if (!userId) {
            return res.status(400).json({ msg: '请提供用户ID' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ msg: '用户不存在' });
        }

        const existingAdmin = await prisma.admin.findUnique({ where: { userId } });
        if (existingAdmin) {
            return res.status(400).json({ msg: '该用户已是管理员' });
        }

        const admin = await prisma.admin.create({
            data: {
                userId,
                role: 'ADMIN',
                permissions: permissions || {}
            }
        });

        res.json({ msg: '添加管理员成功', admin });
    } catch (err) {
        console.error('添加管理员失败:', err);
        res.status(500).json({ msg: '添加失败' });
    }
};

exports.removeAdmin = async (req, res) => {
    try {
        const { userId } = req.params;

        const admin = await prisma.admin.findUnique({ where: { userId } });
        if (!admin) {
            return res.status(404).json({ msg: '管理员不存在' });
        }

        await prisma.admin.delete({ where: { userId } });

        res.json({ msg: '移除管理员成功' });
    } catch (err) {
        console.error('移除管理员失败:', err);
        res.status(500).json({ msg: '移除失败' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, pageSize = 20, keyword } = req.query;

        const where = keyword ? {
            OR: [
                { nickname: { contains: keyword } },
                { phone: { contains: keyword } }
            ]
        } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: parseInt(pageSize),
                orderBy: { createdAt: 'desc' },
                include: { admin: true }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            msg: '获取成功',
            users: users.map(user => ({
                id: user.id,
                nickname: user.nickname,
                avatar: user.avatar,
                phone: user.phone,
                role: user.role,
                isAdmin: !!user.admin,
                createdAt: user.createdAt
            })),
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        });
    } catch (err) {
        console.error('获取用户列表失败:', err);
        res.status(500).json({ msg: '获取失败' });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { disabled } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ msg: '用户不存在' });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role: disabled ? 'ADMIN' : 'USER' }
        });

        res.json({ msg: '更新成功' });
    } catch (err) {
        console.error('更新用户状态失败:', err);
        res.status(500).json({ msg: '更新失败' });
    }
};