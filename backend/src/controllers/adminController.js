const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 获取所有用户
// 获取所有用户（支持搜索）
exports.getAllUsers = async (req, res) => {
    try {
        const { keyword } = req.query;
        const where = {};

        if (keyword) {
            where.OR = [
                { phone: { contains: keyword } },
                { email: { contains: keyword } }
            ];
        }

        const users = await prisma.user.findMany({
            where,
            select: { id: true, phone: true, email: true, name: true, studentId: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '获取用户列表失败' });
    }
};

// 修改用户角色
exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        if (!['USER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ msg: '角色无效' });
        }
        await prisma.user.update({
            where: { id: userId },
            data: { role }
        });
        res.json({ msg: '更新成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '更新失败' });
    }
};

// 获取所有物品
exports.getAllGoods = async (req, res) => {
    try {
        const goods = await prisma.goods.findMany({
            include: { seller: { select: { id: true, name: true, phone: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(goods);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '获取失败' });
    }
};

// 管理员强制下架/上架物品
exports.updateGoodsStatus = async (req, res) => {
    try {
        const { goodsId } = req.params;
        const { status } = req.body;
        if (!['ACTIVE', 'INACTIVE', 'SOLD'].includes(status)) {
            return res.status(400).json({ msg: '状态无效' });
        }
        await prisma.goods.update({
            where: { id: goodsId },
            data: { status }
        });
        res.json({ msg: '状态已更新' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '操作失败' });
    }
};

// 删除物品（硬删除）
exports.deleteGoods = async (req, res) => {
    try {
        const { goodsId } = req.params;
        await prisma.goods.delete({ where: { id: goodsId } });
        res.json({ msg: '删除成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '删除失败' });
    }
};

// 获取统计数据（真实数据，包含较上月增长率）
exports.getStats = async (req, res) => {
    try {
        // 获取当前时间范围
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // 本月开始时间
        const thisMonthStart = new Date(currentYear, currentMonth, 1);
        // 上月开始时间
        const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
        // 上月末时间
        const lastMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

        // 本周开始时间（周一）
        const weekStart = new Date(now);
        const dayOfWeek = now.getDay();
        weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 7 : dayOfWeek) + 1);
        weekStart.setHours(0, 0, 0, 0);

        // 上周开始时间
        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(weekStart.getDate() - 7);
        const lastWeekEnd = new Date(weekStart);
        lastWeekEnd.setMilliseconds(-1);

        // ========== 基础统计 ==========
        const totalUsers = await prisma.user.count();
        const totalGoods = await prisma.goods.count();
        const activeGoodsCount = await prisma.goods.count({ where: { status: 'ACTIVE' } });
        const totalOrders = await prisma.order.count();
        const completedOrders = await prisma.order.count({ where: { status: 'COMPLETED' } });
        const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });

        // ========== 本月 vs 上月增长率 ==========
        // 本月新增用户数
        const thisMonthNewUsers = await prisma.user.count({
            where: { createdAt: { gte: thisMonthStart } }
        });
        // 上月新增用户数
        const lastMonthNewUsers = await prisma.user.count({
            where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } }
        });
        const userGrowthRate = lastMonthNewUsers === 0
            ? (thisMonthNewUsers > 0 ? 100 : 0)
            : ((thisMonthNewUsers - lastMonthNewUsers) / lastMonthNewUsers * 100).toFixed(1);

        // 本月新增物品数
        const thisMonthNewGoods = await prisma.goods.count({
            where: { createdAt: { gte: thisMonthStart } }
        });
        // 上月新增物品数
        const lastMonthNewGoods = await prisma.goods.count({
            where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } }
        });
        const goodsGrowthRate = lastMonthNewGoods === 0
            ? (thisMonthNewGoods > 0 ? 100 : 0)
            : ((thisMonthNewGoods - lastMonthNewGoods) / lastMonthNewGoods * 100).toFixed(1);

        // 本月新增在售物品
        const thisMonthNewActive = await prisma.goods.count({
            where: {
                status: 'ACTIVE',
                createdAt: { gte: thisMonthStart }
            }
        });
        const lastMonthNewActive = await prisma.goods.count({
            where: {
                status: 'ACTIVE',
                createdAt: { gte: lastMonthStart, lt: thisMonthStart }
            }
        });
        const activeGrowthRate = lastMonthNewActive === 0
            ? (thisMonthNewActive > 0 ? 100 : 0)
            : ((thisMonthNewActive - lastMonthNewActive) / lastMonthNewActive * 100).toFixed(1);

        // 本月新增订单数
        const thisMonthNewOrders = await prisma.order.count({
            where: { createdAt: { gte: thisMonthStart } }
        });
        const lastMonthNewOrders = await prisma.order.count({
            where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } }
        });
        const ordersGrowthRate = lastMonthNewOrders === 0
            ? (thisMonthNewOrders > 0 ? 100 : 0)
            : ((thisMonthNewOrders - lastMonthNewOrders) / lastMonthNewOrders * 100).toFixed(1);

        // ========== 本周新增数据 ==========
        const weekNewUsers = await prisma.user.count({
            where: { createdAt: { gte: weekStart } }
        });

        const weekNewGoods = await prisma.goods.count({
            where: { createdAt: { gte: weekStart } }
        });

        const weekOrders = await prisma.order.count({
            where: { createdAt: { gte: weekStart } }
        });

        // 上周新增用户（用于周环比）
        const lastWeekNewUsers = await prisma.user.count({
            where: { createdAt: { gte: lastWeekStart, lt: weekStart } }
        });
        const weekUserGrowthRate = lastWeekNewUsers === 0
            ? (weekNewUsers > 0 ? 100 : 0)
            : ((weekNewUsers - lastWeekNewUsers) / lastWeekNewUsers * 100).toFixed(1);

        // ========== 今日新增数据 ==========
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayNewUsers = await prisma.user.count({
            where: { createdAt: { gte: todayStart } }
        });

        // 昨日新增用户（用于日环比）
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const yesterdayNewUsers = await prisma.user.count({
            where: { createdAt: { gte: yesterdayStart, lt: todayStart } }
        });
        const todayUserGrowthRate = yesterdayNewUsers === 0
            ? (todayNewUsers > 0 ? 100 : 0)
            : ((todayNewUsers - yesterdayNewUsers) / yesterdayNewUsers * 100).toFixed(1);

        // ========== 近6个月用户增长趋势 ==========
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - i);
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);

            const count = await prisma.user.count({
                where: {
                    createdAt: {
                        gte: startDate,
                        lt: endDate
                    }
                }
            });

            monthlyTrend.push({
                month: `${startDate.getMonth() + 1}月`,
                count
            });
        }

        // ========== 物品分类统计 ==========
        const categoryStats = await prisma.goods.groupBy({
            by: ['category'],
            _count: { id: true },
            where: { status: 'ACTIVE' }
        });

        // 计算分类最大数量（用于进度条）
        const maxCategoryCount = categoryStats.length > 0
            ? Math.max(...categoryStats.map(c => c._count.id))
            : 1;

        res.json({
            // 基础统计
            totalUsers,
            totalGoods,
            activeGoodsCount,
            totalOrders,
            completedOrders,
            pendingOrders,
            // 增长率
            userGrowthRate: parseFloat(userGrowthRate),
            goodsGrowthRate: parseFloat(goodsGrowthRate),
            activeGrowthRate: parseFloat(activeGrowthRate),
            ordersGrowthRate: parseFloat(ordersGrowthRate),
            // 本周数据
            weekNewUsers,
            weekNewGoods,
            weekOrders,
            weekUserGrowthRate: parseFloat(weekUserGrowthRate),
            // 今日数据
            todayNewUsers,
            todayUserGrowthRate: parseFloat(todayUserGrowthRate),
            // 趋势数据
            monthlyTrend,
            categoryStats,
            maxCategoryCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '获取统计失败' });
    }
};

// 获取平台交易统计数据
exports.getTradeStats = async (req, res) => {
    try {
        // 基础统计
        const totalUsers = await prisma.user.count();
        const totalGoods = await prisma.goods.count();
        const totalOrders = await prisma.order.count();
        const totalCompletedOrders = await prisma.order.count({ where: { status: 'COMPLETED' } });

        // 近7天每日订单数
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = await prisma.order.count({
                where: {
                    createdAt: {
                        gte: date,
                        lt: nextDate
                    }
                }
            });
            last7Days.push({
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                count
            });
        }

        // 分类统计（物品数量）
        const categoryStats = await prisma.goods.groupBy({
            by: ['category'],
            _count: { id: true },
            where: { status: 'ACTIVE' }
        });

        // 热门商品排行（按浏览次数）
        const hotGoods = await prisma.goods.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { viewCount: 'desc' },
            take: 10,
            select: {
                id: true,
                title: true,
                price: true,
                viewCount: true,
                seller: { select: { phone: true, nickname: true } }
            }
        });

        // 最近成交订单
        const recentOrders = await prisma.order.findMany({
            where: { status: 'COMPLETED' },
            orderBy: { updatedAt: 'desc' },
            take: 10,
            include: {
                goods: { select: { title: true, price: true } },
                buyer: { select: { phone: true, nickname: true } }
            }
        });

        // 获取卖家信息（通过 goods.seller）
        const formattedRecentOrders = await Promise.all(recentOrders.map(async (order) => {
            const goods = await prisma.goods.findUnique({
                where: { id: order.goodsId },
                include: { seller: { select: { phone: true, nickname: true } } }
            });
            return {
                id: order.id,
                goodsTitle: order.goods.title,
                price: order.goods.price,
                buyerName: order.buyer.nickname || order.buyer.phone,
                sellerName: goods?.seller?.nickname || goods?.seller?.phone || '未知',
                completedAt: order.updatedAt
            };
        }));

        res.json({
            totalUsers,
            totalGoods,
            totalOrders,
            totalCompletedOrders,
            completionRate: totalOrders > 0 ? ((totalCompletedOrders / totalOrders) * 100).toFixed(1) : 0,
            last7Days,
            categoryStats,
            hotGoods,
            recentOrders: formattedRecentOrders
        });
    } catch (err) {
        console.error('交易统计错误:', err);
        res.status(500).json({ msg: '获取统计失败: ' + err.message });
    }
};