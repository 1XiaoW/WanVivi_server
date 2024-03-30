const Router = require('koa-router');
const comment = new Router();

const comment_handler = require('../router_handler/comment');

// 获取评论
comment.get('/comment/:com_id?', comment_handler.getComment);

// 获取所有评论
comment.get('/allComment', comment_handler.getAllComment);
// 发布评论
comment.post('/auth/comment', comment_handler.postComment);

// 删除评论
comment.delete('/auth/comment', comment_handler.deleteComment);

module.exports = comment;
