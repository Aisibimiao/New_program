const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false, // 587 端口使用 STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendEmail(to, subject, text) {
    await transporter.sendMail({
        from: `"重庆电子科技大学校内二手物品交易平台" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
    });
}

async function sendVerificationCode(to, code) {
    const text = `【重电校园二手平台】您的验证码是：${code}，请在15分钟内使用。`;
    await sendEmail(to, '重电校园二手平台 - 验证码', text);
}

module.exports = { sendVerificationCode };