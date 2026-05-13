const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashed = await bcrypt.hash('123456', 10);
    const user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashed,
        nickname: '管理员',
        role: 'ADMIN'
      }
    });
    console.log('管理员账号创建成功:', user.email);
  } catch (err) {
    console.log('账号可能已存在，尝试查找现有管理员:', err.message);
    const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (existing) {
      console.log('现有管理员邮箱:', existing.email);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();