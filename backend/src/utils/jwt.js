const jwt = require('jsonwebtoken')

function generateToken(userId, role, openid) {
    return jwt.sign(
        { id: userId, role, openid },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )
}

function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        return null
    }
}

module.exports = { generateToken, verifyToken }