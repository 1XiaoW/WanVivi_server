// 首页路由配置文件，用来存放首页所需接口
const Router = require('koa-router');
const home = new Router();
// 引入接口函数
const home_handler = require('../router_handler/home');

// 获取频道列表信息
home.get('/channel/list', home_handler.getChannelList);
// 获取首页轮播图信息
home.get('/banner/info', home_handler.getCarouselInfo);

module.exports = home;
