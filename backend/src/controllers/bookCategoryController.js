const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getBookCategories = async (req, res) => {
    try {
        const { type } = req.query;

        const where = type ? { type } : {};

        const categories = await prisma.$queryRaw`
            SELECT id, type, name, sort FROM book_category
            WHERE type = ${type || 'college'}
            ORDER BY sort ASC
        `;

        res.json({
            msg: '获取成功',
            categories
        });
    } catch (err) {
        console.error('获取书籍分类失败:', err);
        res.status(500).json({ msg: '获取失败' });
    }
};

exports.getAllBookCategories = async (req, res) => {
    try {
        const categories = await prisma.$queryRaw`
            SELECT id, type, name, sort FROM book_category
            ORDER BY type, sort ASC
        `;

        const grouped = {
            college: [],
            major: [],
            grade: []
        };

        categories.forEach(cat => {
            if (grouped[cat.type]) {
                grouped[cat.type].push(cat);
            }
        });

        res.json({
            msg: '获取成功',
            categories: grouped
        });
    } catch (err) {
        console.error('获取书籍分类失败:', err);
        res.status(500).json({ msg: '获取失败' });
    }
};

exports.addBookCategory = async (req, res) => {
    try {
        const { type, name, sort = 0 } = req.body;

        if (!type || !name) {
            return res.status(400).json({ msg: '请提供类型和名称' });
        }

        if (!['college', 'major', 'grade'].includes(type)) {
            return res.status(400).json({ msg: '类型必须是 college, major 或 grade' });
        }

        const [result] = await prisma.$queryRaw`
            INSERT INTO book_category (id, type, name, sort)
            VALUES (UUID(), ${type}, ${name}, ${sort})
        `;

        res.json({ msg: '添加成功' });
    } catch (err) {
        console.error('添加书籍分类失败:', err);
        res.status(500).json({ msg: '添加失败' });
    }
};

exports.deleteBookCategory = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.$queryRaw`
            DELETE FROM book_category WHERE id = ${id}
        `;

        res.json({ msg: '删除成功' });
    } catch (err) {
        console.error('删除书籍分类失败:', err);
        res.status(500).json({ msg: '删除失败' });
    }
};