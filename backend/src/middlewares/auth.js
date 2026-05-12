const { verifyToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: '未提供认证令牌' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ msg: '无效或过期的令牌' });
    }
    req.user = decoded; // { id, role }
    next();
}

module.exports = authMiddleware;