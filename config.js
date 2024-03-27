// 全局配置文件

// 数据库连接池
const pool = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'admin123',
  database: 'wanvivi',
};

// Redis配置
const REDIS_CONF = {
  port: 6379,
  host: '127.0.0.1',
  db: 1, // 指定使用的数据库索引
};

// jwt(token)配置属性
const jwtConfig = {
  //加密和解密的Token的密钥
  jwtSecretKey: 'lxw No1 ^_^',
  //这是token的有效期
  expiresIn: '10h',
};
// 监听端口
const port = 5051;

module.exports = {
  pool,
  jwtConfig,
  port,
  REDIS_CONF,
};
