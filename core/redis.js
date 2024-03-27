const redis = require('redis');
const { promisify } = require('util');
const { REDIS_CONF } = require('../config');

const client = redis.createClient({
  host: REDIS_CONF.host,
  port: REDIS_CONF.port,
  db: REDIS_CONF.db, // 使用指定的数据库索引
});

client.on('error', function (error) {
  console.error(error);
});

// 将原始的 callback 风格的 Redis 函数转换为 Promise 风格
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const expireAsync = promisify(client.expire).bind(client);

// Koa2 全局中间件，将 Redis 客户端挂载到 ctx 上
async function redisMiddleware(ctx, next) {
  ctx.redis = {
    /**
     * 设置 Redis 键值对
     * @param {string} key 键
     * @param {string|object} val 值
     * @param {number} timeout 过期时间，单位秒
     */
    async set(key, val, timeout) {
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      try {
        await setAsync(key, val);
        if (timeout) {
          await expireAsync(key, timeout);
        }
      } catch (error) {
        console.error('Redis set error:', error);
      }
    },

    /**
     * 获取 Redis 中指定键的值
     * @param {string} key
     * @returns {Promise<any>} 存储在 Redis 中的值
     */
    async get(key) {
      const val = await getAsync(key);
      if (val === null) {
        return null;
      } else {
        try {
          return JSON.parse(val);
        } catch (error) {
          return val;
        }
      }
    },
  };
  await next();
}

module.exports = redisMiddleware;
