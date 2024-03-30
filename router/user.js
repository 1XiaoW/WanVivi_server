const Router = require('koa-router');
const user = new Router();

// 引入接口处理函数
const user_handler = require('../router_handler/user');

// 提交用户注册信息
user.post('/reguser', user_handler.reguser);
// 提交用户登录信息
user.post('/login', user_handler.login);
// 获取用户信息
user.get('/auth/userInfo/:id', user_handler.getUserInfo);
// 获取用户消息读取状态
user.get('/auth/userReadState/:id', user_handler.getReadState);
// 更新用户信息
user.put('/auth/userInfo/:id', user_handler.putUserInfo);
// 更新用户头像
user.put('/auth/userAvatar/:id', user_handler.putUserAvatar);
// 更新用户签名
user.put('/auth/userSign/:id', user_handler.putUserSign);
// 修改用户密码
user.put('/auth/userPwd/:id', user_handler.putUserPwd);
// 获取其他用户信息
user.get('/userInfo/:id', user_handler.getOtherUserInfo);
// 更改用户是否阅读消息状态
user.put('/auth/readMsgState/:id', user_handler.putReadMsgState);

// 查询动态
user.get('/dynamic/:id', user_handler.getDynamic);
// 添加动态
user.post('/auth/addDynamic/:id', user_handler.addDynamic);
// 删除动态
user.delete('/auth/deleteDynamic/:id', user_handler.deleteDynamic);

// 按照用户名进行模糊查找
user.get('/auth/searchByUsername', user_handler.searchByUsername);
// 删除用户
user.delete('/auth/deleteById', user_handler.deleteUser);

// 发送验证码
user.post('/auth/sendCode', user_handler.sendCode);
module.exports = user;
