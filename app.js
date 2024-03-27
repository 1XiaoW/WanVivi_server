// 主入口文件
// 引入koa2
const koa = require('koa2');
// 解析请求体,可以拿到前端post传来的数据挂载在ctx.request.body
// 使用koa-bodyparser中间件解析JSON和urlencoded请求体
// const bodyparser = require('koa-bodyparser');
// 用koaBody代替，实现解析文件上传
const { koaBody } = require('koa-body');

// 实例化函数
const app = new koa();
// 引入路由文件
const router = require('./router');
// 引入跨域模块
const cors = require('koa2-cors');
// 引入静态资源模块
const static = require('koa-static');
const path = require('path');
// 用于验证所有需要进行token验证的路由
const koaJwt = require('koa-jwt');
// 引入全局请求错误文件
const { catchErr } = require('./utils/exception');
// 引入全局配置文件
const config = require('./config');
// 引入Redis中间件
const redisMiddleware = require('./core/redis');
// 引入socket.io实现实时传输
const socket = require('socket.io');

// 允许静态资源访问
app.use(
  static(path.join(__dirname + '/assets'), {
    setHeaders: (ctx) => {
      ctx.setHeader('accept-ranges', 'bytes');
    },
  })
);
// 允许跨域访问:需在router之前
app.use(cors());
// 解析请求体
// app.use(bodyparser());
app.use(koaBody({ multipart: true }));
// 全局错误监听中间件
app.use(catchErr);
// 使用Redis中间件
app.use(redisMiddleware);
// 一定要在路由之前，封装ctx.cc函数
app.use(async (ctx, next) => {
  ctx.cc = function (err, status = 1, success = false) {
    ctx.body = {
      status,
      message: err instanceof Error ? err.message : err,
      success,
    };
  };
  await next();
});

// 在全局应用koa-jwt中间件进行token验证
app.use(
  koaJwt({
    secret: config.jwtConfig.jwtSecretKey,
    algorithms: ['HS256'],
  }).unless({
    // 选中不包含单词 "auth" 的字符串的api接口
    path: [/^(?!.*auth\b).*$/],
    // path: [/^\/api/],
  })
);

// 路由挂载
app.use(router.routes(), router.allowedMethods());
// 监听端口
const server = app.listen(config.port, () => {
  console.log('Server is running at http://localhost:5051');
});

// 创建socket实例并初始化
const io = socket(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// 全局对象添加一个属性
global.onlineUsers = new Map();

// 监听连接状态
io.on('connection', (socket) => {
  global.chatSocket = socket;
  // 监听add-user有无人发送数据
  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id);
  });
  // 监听send-msg有无人发送数据
  socket.on('send-msg', (data) => {
    const sendUserSocket = onlineUsers.get(data.receiverId);
    if (sendUserSocket) {
      // 向msg-receive发送数据
      socket.to(sendUserSocket).emit('msg-receive', data.chatCount);
    }
  });
});
