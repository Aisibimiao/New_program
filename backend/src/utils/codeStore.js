// 简单内存存储，用于保存邮箱验证码（key: 邮箱, value: { code, expiresAt }）
// 生产环境请替换为 Redis
const codeMap = new Map()

// 存储验证码，有效期 15 分钟
function saveCode(email, code) {
    const expiresAt = Date.now() + 15 * 60 * 1000
    codeMap.set(email, { code, expiresAt })
}

// 验证验证码是否正确且未过期
function verifyCode(email, code) {
    const record = codeMap.get(email)
    if (!record) return false
    if (record.code !== code) return false
    if (Date.now() > record.expiresAt) {
        codeMap.delete(email)
        return false
    }
    // 验证成功后删除验证码，防止重复使用
    codeMap.delete(email)
    return true
}

module.exports = { saveCode, verifyCode }