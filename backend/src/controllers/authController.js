const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { sendVerificationCode } = require('../utils/email');
const { saveCode, verifyCode } = require('../utils/codeStore');
const axios = require('axios');

const prisma = new PrismaClient();

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 注册前发送验证码
exports.sendRegisterCode = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: '邮箱不能为空' });
    const existing = await prisma.user.findUnique({
        where: { email },
    });
    if (existing) return res.status(400).json({ msg: '该邮箱已注册' });

    const code = generateCode();
    console.log(`\n========== [开发调试] 验证码 ==========`);
    console.log(`邮箱: ${email}`);
    console.log(`验证码: ${code}`);
    console.log(`======================================\n`);
    try {
        await sendVerificationCode(email, code);
    } catch (err) {
        console.error('邮件发送失败:', err);
    }
    saveCode(email, code);
    res.json({ msg: '验证码已发送' });
};

// 注册
exports.register = async (req, res) => {
    const { email, password, code, nickname } = req.body;
    if (!email || !password || !code)
        return res.status(400).json({ msg: '请填写完整信息' });
    if (!verifyCode(email, code))
        return res.status(400).json({ msg: '验证码错误或已过期' });

    const existing = await prisma.user.findUnique({
        where: { email },
    });
    if (existing) return res.status(400).json({ msg: '用户已存在' });

    const hashed = await bcrypt.hash(password, 10);
    const defaultAvatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(nickname || email.split('@')[0])}&backgroundColor=b6e3f4`;
    const user = await prisma.user.create({
        data: {
            email,
            password: hashed,
            nickname: nickname || email.split('@')[0],
            avatar: defaultAvatar,
            role: 'USER',
        },
        select: { id: true, email: true, nickname: true, avatar: true, role: true },
    });
    const token = generateToken(user.id, user.role);
    res.status(201).json({ msg: '注册成功', token, user });
};

// 登录
exports.login = async (req, res) => {
    const { account, password } = req.body;
    if (!account || !password)
        return res.status(400).json({ msg: '账号和密码不能为空' });

    const user = await prisma.user.findFirst({
        where: { OR: [{ phone: account }, { email: account }] },
    });
    if (!user) return res.status(401).json({ msg: '账号或密码错误' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ msg: '账号或密码错误' });

    const token = generateToken(user.id, user.role);
    res.json({
        msg: '登录成功',
        token,
        user: {
            id: user.id,
            phone: user.phone,
            email: user.email,
            name: user.name,
            nickname: user.nickname,
            studentId: user.studentId,
            avatar: user.avatar,
            role: user.role,
        },
    });
};

// 忘记密码发送验证码
exports.sendResetCode = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: '邮箱不能为空' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ msg: '邮箱未注册' });

    const code = generateCode();
    try {
        await sendVerificationCode(email, code);
        saveCode(email, code);
        res.json({ msg: '重置验证码已发送' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '邮件发送失败' });
    }
};

// 重置密码
exports.resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword)
        return res.status(400).json({ msg: '请填写完整信息' });
    if (!verifyCode(email, code))
        return res.status(400).json({ msg: '验证码错误或已过期' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { password: hashed } });
    res.json({ msg: '密码重置成功' });
};

// 获取当前用户信息
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phone: true,
                email: true,
                name: true,
                nickname: true,
                studentId: true,
                avatar: true,
                role: true,
                createdAt: true
            }
        });
        if (!user) {
            return res.status(404).json({ msg: '用户不存在' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '获取用户信息失败' });
    }
};

// 更新用户信息
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, nickname, studentId } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (nickname !== undefined) updateData.nickname = nickname;
        if (studentId !== undefined) updateData.studentId = studentId;

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                phone: true,
                email: true,
                name: true,
                nickname: true,
                studentId: true,
                avatar: true,
                role: true
            }
        });
        res.json({ msg: '更新成功', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '更新失败' });
    }
};

// 上传头像
exports.uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!req.file) {
            return res.status(400).json({ msg: '请选择图片' });
        }
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        const user = await prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
            select: { avatar: true }
        });
        res.json({ msg: '上传成功', avatar: user.avatar });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: '上传失败' });
    }
};

// 微信小程序登录
exports.wechatLogin = async (req, res) => {
    try {
        const { code, encryptedData, iv, nickName, avatarUrl } = req.body;

        if (!code) {
            return res.status(400).json({ msg: '缺少code参数' });
        }

        const appId = 'wx1234567890123456';
        const appSecret = 'your_app_secret';

        const response = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
            params: {
                appid: appId,
                secret: appSecret,
                js_code: code,
                grant_type: 'authorization_code'
            }
        });

        const { openid, session_key } = response.data;

        if (!openid) {
            return res.status(400).json({ msg: '获取openid失败' });
        }

        let user = await prisma.user.findUnique({
            where: { openid }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    openid,
                    nickname: nickName || '微信用户',
                    avatar: avatarUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(nickName || 'user')}&backgroundColor=b6e3f4`,
                    role: 'USER'
                }
            });
        }

        const token = generateToken(user.id, user.role);

        res.json({
            msg: '登录成功',
            token,
            user: {
                id: user.id,
                openid: user.openid,
                nickname: user.nickname,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (err) {
        console.error('微信登录失败:', err);
        res.status(500).json({ msg: '微信登录失败' });
    }
};