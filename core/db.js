// sequelize连接数据库入口

// 解构出sequelize里的Sequelize对象
const { Sequelize } = require('sequelize');
// 引入全局配置文件
const { pool } = require('../config');
// 实例化对象并且传入数据库信息
const sequelize = new Sequelize(pool.database, pool.user, pool.password, {
  host: pool.host,
  port: pool.port,
  dialect: 'mysql',
  timezone: '+08:00',
  dialectOptions: {
    dateStrings: true,
    typeCast: true,
  },
});

// 连接测试
sequelize
  .authenticate()
  .then(() => {
    console.log('[成功]数据库连接已建立');
  })
  .catch((error) => {
    console.error('[失败]无法连接到数据库:', error);
  });

// 同步模型定义
sequelize
  .sync()
  .then(() => {
    console.log('[成功]模型同步完成');
  })
  .catch((error) => {
    console.error('[失败]模型同步出错:', error);
  });

module.exports = sequelize;
