// 导入生成Token的包
const jwt = require('jsonwebtoken');
// 导入全局的配置文件
const config = require('../config');

// 设置token参数，并返回token字符串
const setToken = user =>
  // 将user信息进行token转换，jwSecretKey是自定义的密钥，expiresIn是token的有效期
  jwt.sign(user, config.jwtConfig.jwtSecretKey, {
    expiresIn: config.jwtConfig.expiresIn,
  });

// 从token中获取信息
const getDecodeToken = token =>
  jwt.verify(token, config.jwtConfig.jwtSecretKey);

module.exports = {
  setToken,
  getDecodeToken,
};
