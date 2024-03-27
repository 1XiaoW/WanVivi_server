// 路由文件主入口
const Router = require('koa-router'); // 引入koa-router
// 实例化Router并设置默认前缀/api
const router = new Router();
router.prefix('/api');

const home = require('./home'); // 引入home路由文件
const video = require('./video'); // 引入video路由文件
const user = require('./user'); // 引入user路由文件
const comment = require('./comment');
const message = require('./message');
const chat = require('./chat');

// router.redirect('/', '/api/home/channel/list'); // 重定向地址

// 挂载路由
router.use('/home', home.routes(), home.allowedMethods());
router.use('/video', video.routes(), video.allowedMethods());
router.use('/user', user.routes(), user.allowedMethods());
router.use('/video', comment.routes(), comment.allowedMethods());
router.use('/message', message.routes(), message.allowedMethods());
router.use('/chat', chat.routes(), chat.allowedMethods());
router.get('/auth', (ctx, next) => {
  ctx.cc('Token仍然有效', 200, true);
  next();
});

module.exports = router;
