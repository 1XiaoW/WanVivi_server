//导入验证规则的包
const joi = require('joi');

//定义用户名和密码的验证规则
const username = joi
  .string()
  .alphanum()
  .min(1)
  .max(10)
  .required()
  .error(new Error('用户名格式不正确!'));
const password = joi
  .string()
  .pattern(/^[\S]{6,12}$/)
  .required()
  .error(new Error('密码格式不正确!'));

//定义id,nickname,email的验证规则
const id = joi.number().integer().min(1).required();
const nickname = joi
  .string()
  .min(1)
  .max(16)
  .required()
  .error(new Error('昵称格式不正确'));
const email = joi.string().email().error(new Error('邮箱格式不正确'));
const name = joi.string();

//验证avatar头像的验证规则
const avatar = joi.string().dataUri().required();

//定义验证注册和登录表单数据的规则对象
exports.reg_login_schema = joi.object({
  username,
  password,
});

//验证规则对象，更新用户基本信息
exports.update_userinfo_schema = joi.object({
  //需要对req.body里面的数据进行验证
  name,
  nickname,
  email,
});

//验证规则对象-更新密码
exports.update_password_schema = {
  body: {
    oldPwd: password,
    newPwd: joi.not(joi.ref('oldPwd')).concat(password),
  },
};

//验证规则对象-更新头像
exports.update_avatar_schema = {
  body: {
    avatar,
  },
};

module.exports = {
  ...module.exports,
  password,
};
