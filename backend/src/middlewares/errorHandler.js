function errorHandler(err, req, res, next) {
    console.error(err.stack);
    const status = err.status || 500;
    const message = err.message || '服务器内部错误';
    res.status(status).json({ msg: message });
}

module.exports = { errorHandler };