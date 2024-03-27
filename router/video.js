const Router = require('koa-router');
const video = new Router();
const video_handler = require('../router_handler/video');
// 获取视频列表
video.get('/channel/:order?', video_handler.getVideoList);
// 获取单个视频信息通过ID
video.get('/', video_handler.getVideoOne);
// 获取播放量前五视频列表
video.get('/hot', video_handler.hotVideo);
// 发布视频接口
video.post('/auth/upload', video_handler.uploadVideo);
// 视频点赞接口
video.post('/auth/like/:vId', video_handler.isLike);
// 视频收藏接口
video.post('/auth/collect/:vId', video_handler.isCollect);
// 获取用户是否点赞和收藏
video.get('/auth/isLikeAndCollect/:vId', video_handler.isLikeAndCollect);
// 通过作者id获取作者投稿视频
video.get(
  '/getVideoListByAuthorId/:order?',
  video_handler.getVideoListByAuthorId
);
// 通过作者id获取作者收藏视频
video.get(
  '/getCollectVideoByAuthorId/',
  video_handler.getCollectVideoByAuthorId
);
// 通过作者id获取作者所有视频点赞和播放量总和
video.get(
  '/getAllVideosLikeAndViewByAuthorId/',
  video_handler.getAllVideosLikeAndViewByAuthorId
);

// 通过关键字搜索相关视频
video.get('/getSearchVideo/', video_handler.getSearchVideo);

// 获取当前视频的评论数
video.post('/getVideoCommentTotal/', video_handler.getVideoCommentTotal);

// 获取主页特定频道每个频道的5条数据
video.post('/getFiveVideosOfChannel', video_handler.getFiveVideosOfChannel);

// ------------------视频管理------------------

// 更改投稿视频状态 0通过 1审核中 2未通过 3已删除
video.post('/changeVideoState/', video_handler.changeVideoState);

// 删除视频投稿
video.delete('/deleteVideo/', video_handler.deleteVideo);

// 获取审核状态已经完成的视频列表 state=0或2
video.get('/approvedVideos/', video_handler.getApprovedVideos);

module.exports = video;
