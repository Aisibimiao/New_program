// 加载环境变量（必须放在最前面）
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// 导入路由模块
const authRoutes = require('./routes/authRoutes');
const goodsRoutes = require('./routes/goodsRoutes');
const orderRoutes = require('./routes/orderRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const payRoutes = require('./routes/payRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');

// 导入全局错误处理中间件
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// ========================
// 基础安全与通用中间件
// ========================

// 1. Helmet：设置安全的 HTTP 头，防止常见攻击（如 XSS）
// 注意：需要配置 CSP 以允许图片加载
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "http://localhost:3000", "http://localhost:5173", "https:"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        },
    },
}));

// 2. CORS：允许前端跨域访问（支持web和小程序）
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://localhost:8081',
        'http://127.0.0.1:8081',
        'https://servicewechat.com',
        'http://192.168.1.100:5173'
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'token'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// 3. 解析 JSON 请求体（限制大小，防止过大 JSON）
app.use(express.json({ limit: '10mb' }));

// 4. 静态文件服务：让上传的图片可以被访问（添加 CORS 头）
app.use('/uploads', (req, res, next) => {
    // 设置跨域资源策略，允许跨域加载图片
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // 预检请求处理
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
}, express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, path, stat) => {
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

// 5. 全局 API 限流（防暴力攻击、爬虫）
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 200,                 // 每个 IP 最多 200 次请求
    message: { msg: '请求过于频繁，请稍后再试' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', globalLimiter);

// ========================
// 路由注册
// ========================

// 认证相关
app.use('/api/auth', authRoutes);

// 物品相关
app.use('/api/goods', goodsRoutes);

// 订单相关
app.use('/api/orders', orderRoutes);

// 收藏相关
app.use('/api/favorites', favoriteRoutes);

// 支付相关
app.use('/api/pay', payRoutes);

// 管理员功能
app.use('/api/admin', adminRoutes);

// 聊天相关
app.use('/api/chat', chatRoutes);

// ========================
// 健康检查
// ========================
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========================
// 根路径欢迎信息
// ========================
app.get('/', (req, res) => {
    res.json({ msg: '校园二手平台后端服务已启动', version: '1.0.0' });
});

// ========================
// 404 处理（匹配不到任何路由）
// ========================
app.use('*', (req, res) => {
    res.status(404).json({ msg: `接口 ${req.originalUrl} 不存在` });
});

// ========================
// 全局错误处理（必须放在所有路由之后）
// ========================
app.use(errorHandler);

module.exports = app;