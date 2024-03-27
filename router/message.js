// 首页路由配置文件，用来存放首页所需接口
const Router = require('koa-router');
const message = new Router();
// 引入接口函数
const message_handler = require('../router_handler/message');

// 发布新通知
message.post('/', message_handler.publishMessage);
// 按信息分类获取信息列表
message.get('/', message_handler.getMessage);
// 修改信息
message.post('/updateMsgById', message_handler.updateMessage);
// 删除信息
message.delete('/deleteById', message_handler.deleteMessage);
// 按照消息标题进行模糊查找
message.get('/searchByTitle', message_handler.searchByTitle);

module.exports = message;
