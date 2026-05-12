function adminOnly(req, res, next) {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ msg: '需要管理员权限' });
    }
    next();
}

module.exports = { adminOnly };