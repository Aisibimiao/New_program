const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const prisma = new PrismaClient()

async function main() {
    const adminPhone = process.env.ADMIN_PHONE || '13800000000'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    let existingAdmin = await prisma.user.findUnique({
        where: { phone: adminPhone }
    })

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10)
        existingAdmin = await prisma.user.create({
            data: {
                phone: adminPhone,
                password: hashedPassword,
                role: 'ADMIN',
                name: 'System Admin',
                nickname: 'Admin',
                avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Admin&backgroundColor=667eea'
            }
        })
        console.log('管理员账号已创建')
    }

    const testUserPhone = '13800000001'
    let testUser = await prisma.user.findUnique({
        where: { phone: testUserPhone }
    })

    if (!testUser) {
        const hashedPassword = await bcrypt.hash('123456', 10)
        testUser = await prisma.user.create({
            data: {
                phone: testUserPhone,
                password: hashedPassword,
                role: 'USER',
                name: 'Test User',
                nickname: '测试用户',
                avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=TestUser&backgroundColor=4facfe'
            }
        })
        console.log('测试用户账号已创建')
    }

    const existingGoodsCount = await prisma.goods.count()
    if (existingGoodsCount === 0) {
        const goodsList = [
            {
                title: 'iPhone 14 Pro Max 256GB',
                description: '几乎全新的iPhone 14 Pro Max，使用不到半年，电池健康度98%，无磕碰划痕，配件齐全。',
                price: 6999,
                originalPrice: 8999,
                category: 'ELECTRONICS',
                condition: 1,
                images: JSON.stringify(['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=iPhone%2014%20Pro%20Max%20smartphone%20on%20white%20background&image_size=square']),
                status: 'ACTIVE',
                location: '教学楼A栋',
                contact: '微信: testuser123',
                sellerId: testUser.id
            },
            {
                title: 'MacBook Air M2 13寸',
                description: '2023款MacBook Air M2，8GB+256GB，深空灰色，保修期至2025年，附带原装充电器。',
                price: 6500,
                originalPrice: 9499,
                category: 'ELECTRONICS',
                condition: 1,
                images: JSON.stringify(['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=MacBook%20Air%20laptop%20on%20desk&image_size=square']),
                status: 'ACTIVE',
                location: '图书馆',
                contact: 'QQ: 123456789',
                sellerId: testUser.id
            },
            {
                title: '高等数学（第七版）上下册',
                description: '同济大学高等数学第七版，上下册全套，有少量笔记标注，不影响阅读。',
                price: 35,
                originalPrice: 78,
                category: 'BOOK',
                condition: 2,
                images: JSON.stringify(['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=math%20textbook%20higher%20mathematics&image_size=square']),
                status: 'ACTIVE',
                location: '宿舍楼B区',
                contact: '电话: 13800000001',
                sellerId: testUser.id
            },
            {
                title: 'Nike Air Jordan 1 运动鞋',
                description: 'Air Jordan 1 Retro High OG，尺码42.5，穿过几次，成色很新，正品保证。',
                price: 1200,
                originalPrice: 1599,
                category: 'SPORTS',
                condition: 1,
                images: JSON.stringify(['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Nike%20Air%20Jordan%201%20sneakers%20red&image_size=square']),
                status: 'ACTIVE',
                location: '体育馆',
                contact: '微信: jordanfan',
                sellerId: testUser.id
            },
            {
                title: '宜家书架',
                description: '宜家BILLY书架，白色，高度2米，九层，使用一年，无损坏。',
                price: 150,
                originalPrice: 299,
                category: 'LIFE',
                condition: 2,
                images: JSON.stringify(['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=IKEA%20bookshelf%20white%20modern&image_size=square']),
                status: 'ACTIVE',
                location: '学生公寓',
                contact: 'QQ: 987654321',
                sellerId: testUser.id
            },
            {
                title: '羽绒服男款 XL码',
                description: '波司登羽绒服，黑色XL码，充绒量200g，保暖性好，只穿过一个冬天。',
                price: 280,
                originalPrice: 599,
                category: 'CLOTHING',
                condition: 2,
                images: JSON.stringify(['https://neeko-copilot.bytedance.net/api/text_to_image?prompt=black%20down%20jacket%20winter%20coat&image_size=square']),
                status: 'ACTIVE',
                location: '食堂门口',
                contact: '电话: 13800000001',
                sellerId: testUser.id
            }
        ]

        for (const goods of goodsList) {
            await prisma.goods.create({
                data: goods
            })
        }
        console.log('示例商品数据已创建')
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
