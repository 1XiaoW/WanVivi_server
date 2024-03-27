// 首页路由配置文件，用来存放首页所需接口
const Router = require('koa-router');
const chat = new Router();
// 引入接口函数
const chat_handler = require('../router_handler/chat');

// 发送信息
chat.post('/sendMessage', chat_handler.sendMessage);
// 获取所有信息
chat.get('/getAllMessage', chat_handler.getAllMessage);
// 获取对于当前用户获取所有聊天用户
chat.get('/getAllUserList', chat_handler.getAllUserList);

module.exports = chat;
