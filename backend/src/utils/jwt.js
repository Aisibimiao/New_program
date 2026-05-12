const jwt = require('jsonwebtoken')

function generateToken(userId, role) {
    return jwt.sign(
        { id: userId, role },
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