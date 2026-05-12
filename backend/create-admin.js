const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdmin() {
    const phone = '17764857481';
    const password = '123456';
    const email = '3308096218@qq.com';  // 请修改为实际邮箱

    try {
        // 检查用户是否存在
        const existingUser = await prisma.user.findUnique({
            where: { phone }
        });

        if (existingUser) {
            // 存在则更新为管理员
            await prisma.user.update({
                where: { phone },
                data: {
                    role: 'ADMIN',
                    avatar: existingUser.avatar || 'https://api.dicebear.com/9.x/initials/svg?seed=Admin&backgroundColor=667eea'
                }
            });
            console.log(`用户 ${phone} 已设置为管理员`);
        } else {
            // 不存在则创建新管理员
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.create({
                data: {
                    phone,
                    password: hashedPassword,
                    email,
                    role: 'ADMIN',
                    name: '管理员',
                    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Admin&backgroundColor=667eea'
                }
            });
            console.log(`管理员账号创建成功: ${phone} / ${password}`);
        }
    } catch (error) {
        console.error('操作失败:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();