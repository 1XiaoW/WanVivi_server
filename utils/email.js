const nodemailer = require('nodemailer');

// 创建邮件传输对象
let transporter = nodemailer.createTransport({
  service: 'qq', // 使用QQ邮箱服务
  secure: true, // 使用SSL
  port: 465, // SMTP端口
  auth: {
    user: 'your-self@qq.com', // 你的QQ邮箱地址
    pass: 'your-code', // 你的QQ邮箱授权码
  },
});
/**
 * @param to 收件人地址
 * @param subject 邮件主题
 * @param html 邮件HTML内容（可选，如果发送纯文本内容则通常不使用）
 * @param verificationCode 验证码
 */
const sendEmail = (to, subject, html, verificationCode) => {
  // 邮件内容
  let mailOptions = {
    from: 'your-self@qq.com', // 发件人地址
    to, // 收件人地址
    subject, // 邮件主题
    html: html.replace('<!--VERIFICATION_CODE-->', verificationCode), // 替换HTML中的占位符为验证码
  };

  // 发送邮件
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error); // 如果有错误，Promise被拒绝
      } else {
        resolve(200); // 如果没有错误，Promise被解决
      }
    });
  });
};

module.exports = { sendEmail };
