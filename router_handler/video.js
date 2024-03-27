const db = require('../utils/db');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
// 获取视频时长模块
const { getVideoDurationInSeconds } = require('get-video-duration');
const token = require('../utils/token.js');
//引入所需sequelize Model
const { videos, video_urls } = require('../model/video');
const sequelize = require('../core/db');
const { wvv_users } = require('../model/user');
const { channellist } = require('../model/home');
const { users_like } = require('../model/like.js');
const { users_collect } = require('../model/collect.js');
const { comment } = require('../model/comment.js');

exports.getVideoList = async (ctx, next) => {
  let order = ['id', 'DESC'];
  switch (ctx.params.order) {
    case '0':
      order = ['id', 'DESC'];
      break;
    case '1':
      order = ['view_count', 'DESC'];
      break;
    case '2':
      order = ['upload_date', 'DESC'];
      break;

    default:
      order = ['id', 'DESC'];
      break;
  }

  // 从请求体中获取频道id和视频状态
  const { channelId, state, offset, limit } = ctx.query;
  if (channelId && channelId !== '0') {
    // 如果有频道id进行条件搜索
    let result = await videos.findAndCountAll({
      where: { channel_id: channelId, state },
      offset: (offset - 1) * limit,
      limit: limit - 0,
      order: [order],
      attributes: [
        'duration',
        'like_count',
        'review_count',
        'title',
        'upload_date',
        'view_count',
        'author_id',
        'channel_id',
      ],
      include: [
        {
          model: video_urls,
          attributes: ['video_id', 'resolution', 'url', 'video_cover'],
        },
        {
          model: wvv_users,
          attributes: ['username'],
        },
        {
          model: channellist,
          attributes: ['channel'],
        },
      ],
    });
    // 格式化返回的数据
    result.rows = result.rows.map((item) => {
      let { video_urls, wvv_user, channellist, ...rest } = item.toJSON();
      return Object.assign(video_urls[0], wvv_user, channellist, rest);
    });
    ctx.body = {
      status: 200,
      message: result.length !== 0 ? '获取视频列表成功!' : '视频列表为空',
      total: result.count,
      data: result.rows,
      success: true,
    };
  } else {
    let result = await videos.findAndCountAll({
      where: { state },
      offset: (offset - 1) * limit,
      limit: limit - 0,
      order: [['id', 'DESC']],
      attributes: [
        'duration',
        'like_count',
        'review_count',
        'title',
        'upload_date',
        'view_count',
        'author_id',
        'channel_id',
      ],
      include: [
        {
          model: video_urls,
          attributes: ['video_id', 'resolution', 'url', 'video_cover'],
        },
        {
          model: wvv_users,
          attributes: ['username'],
        },
        {
          model: channellist,
          attributes: ['channel'],
        },
      ],
    });
    // 格式化返回的数据
    result.rows = result.rows.map((item) => {
      let { video_urls, wvv_user, channellist, ...rest } = item.toJSON();
      return Object.assign(video_urls[0], wvv_user, channellist, rest);
    });
    ctx.body = {
      status: 200,
      message: result.length !== 0 ? '获取视频列表成功!' : '视频列表为空',
      data: result.rows,
      total: result.count,
      success: true,
    };
  }
};

exports.getVideoOne = async (ctx, next) => {
  let vId = ctx.query.vId;
  let result = await videos.findAll({
    where: {
      id: vId,
    },
    include: [
      {
        model: video_urls,
        attributes: ['video_id', 'resolution', 'url', 'video_cover'],
      },
      {
        model: wvv_users,
        attributes: ['username'],
      },
      {
        model: channellist,
        attributes: ['channel'],
      },
    ],
  });
  result[0].view_count++;
  await result[0].save();
  // 格式化返回的数据
  result = result.map((item) => {
    let { video_urls, wvv_user, channellist, ...rest } = item.toJSON();
    return Object.assign(video_urls[0], wvv_user, channellist, rest);
  });
  ctx.body = {
    status: 200,
    message: '获取视频信息成功!',
    data: result,
    success: true,
  };
};

exports.hotVideo = async (ctx, next) => {
  let result = await videos.findAll({
    order: [['view_count', 'DESC']],
    limit: 5,
    attributes: [
      'duration',
      'like_count',
      'review_count',
      'title',
      'upload_date',
      'view_count',
      'author_id',
      'channel_id',
    ],
    include: [
      {
        model: video_urls,
        attributes: ['video_id', 'resolution', 'url', 'video_cover'],
      },
      {
        model: wvv_users,
        attributes: ['username'],
      },
      {
        model: channellist,
        attributes: ['channel'],
      },
    ],
  });
  // 格式化返回的数据
  result = result.map((item) => {
    let { video_urls, wvv_user, channellist, ...rest } = item.toJSON();
    return Object.assign(video_urls[0], wvv_user, channellist, rest);
  });
  ctx.body = {
    status: 200,
    message: result.length !== 0 ? '获取视频列表成功!' : '视频列表为空',
    data: result,
    success: true,
  };
};

exports.uploadVideo = async (ctx, next) => {
  const authorId = token.getDecodeToken(
    ctx.request.headers.authorization.split(' ')[1]
  ).id;
  const file = ctx.request.files.file; // 获取上传的文件对象
  const coverImgFile = ctx.request.files.coverImg;
  const videoInfo = ctx.request.body; // 获取文件上传信息
  // 生成唯一的文件名
  const fileName = `${Date.now()}_${file.originalFilename}`;
  const coverName = `${Date.now()}_${coverImgFile.originalFilename}`;
  // 指定文件保存路径
  const filePath = path.resolve(
    __dirname,
    '../assets/videos',
    videoInfo.videoAreaName,
    fileName
  );
  const coverPath = path.resolve(
    __dirname,
    '../assets/images',
    videoInfo.videoAreaName,
    coverName
  );
  videoInfo.videoUrl = path.join('/videos', videoInfo.videoAreaName, fileName);
  videoInfo.coverUrl = path.join('/images', videoInfo.videoAreaName, coverName);
  // return (ctx.body = filePath);

  // 数据库插入视频上传数据
  // 开始一个事务
  const t = await sequelize.transaction();
  let videoId = 0;
  try {
    // 创建视频记录
    const video = await videos.create(
      {
        title: videoInfo.videoTitle,
        author_id: authorId,
        upload_date: new Date().toISOString(),
        channel_id: videoInfo.videoAreaId,
        brief: videoInfo.videoBrief,
        // 让每一个投稿的视频先进入审核
        state: 1,
      },
      { transaction: t }
    ); // 在事务中创建记录
    videoId = video.id;
    // 创建视频URL记录
    await video_urls.create(
      {
        video_id: videoId,
        url: videoInfo.videoUrl,
        video_cover: videoInfo.coverUrl,
      },
      { transaction: t }
    ); // 在事务中创建记录

    const videoFs = new Promise((resolve, reject) => {
      const reader = fs.createReadStream(file.filepath);
      const writer = fs.createWriteStream(filePath);
      // 监听写入完成事件，发送响应
      writer.on('finish', () => {
        fs.unlinkSync(file.filepath); // 删除临时文件
        resolve(); // 完成后 resolve Promise
      });
      // 监听写入出错事件，发送错误响应
      writer.on('error', (err) => {
        console.error(err);
        reject(err); // 出错时 reject Promise
      });
      reader.pipe(writer);
    });

    const coverFs = new Promise((resolve, reject) => {
      const coverReader = fs.createReadStream(coverImgFile.filepath);
      const coverWriter = fs.createWriteStream(coverPath);

      // 监听写入完成事件，发送响应
      coverWriter.on('finish', () => {
        fs.unlinkSync(coverImgFile.filepath); // 删除临时文件
        resolve(); // 完成后 resolve Promise
      });

      // 监听写入出错事件，发送错误响应
      coverWriter.on('error', (err) => {
        console.error(err);
        reject(err); // 出错时 reject Promise
      });

      coverReader.pipe(coverWriter);
    });

    await Promise.all([coverFs, videoFs]);

    // From a local path...
    await getVideoDurationInSeconds(filePath).then((duration) => {
      console.log(Math.ceil(duration));
      videos.update(
        { duration: duration }, // 要更新的字段及新值
        { where: { id: videoId } }, // 查询条件
        { transaction: t }
      );
    });
    // 提交事务
    await t.commit();

    ctx.cc('视频上传成功！', 200, true);
  } catch (error) {
    // 回滚事务以撤消所有之前的更改
    await t.rollback();
    ctx.cc(error);
  }
};

// 点赞接口实现
exports.isLike = async (ctx, next) => {
  const userId = token.getDecodeToken(
    ctx.request.headers.authorization.split(' ')[1]
  ).id;

  const videoId = ctx.params.vId;
  // 查询数据库，查找是否存在符合条件的数据
  const existingData = await users_like.findOne({
    where: {
      user_id: userId,
      type: 'v',
      item_id: videoId,
    },
  });
  if (existingData) await existingData.destroy();
  else
    await users_like.create({
      user_id: userId,
      type: 'v',
      item_id: videoId,
    });
  ctx.body = {
    status: 200,
    message: '已完成点赞或取消点赞操作',
    success: true,
  };
};

// 收藏视频接口实现
exports.isCollect = async (ctx, next) => {
  const userId = token.getDecodeToken(
    ctx.request.headers.authorization.split(' ')[1]
  ).id;

  const videoId = ctx.params.vId;
  // 查询数据库，查找是否存在符合条件的数据
  const existingData = await users_collect.findOne({
    where: {
      user_id: userId,
      item_id: videoId,
    },
  });
  if (existingData) await existingData.destroy();
  else
    await users_collect.create({
      user_id: userId,
      item_id: videoId,
      collection_time: new Date(),
    });
  ctx.body = {
    status: 200,
    message: '已完成收藏或取消收藏操作',
    success: true,
  };
};

exports.isLikeAndCollect = async (ctx, next) => {
  const userId = token.getDecodeToken(
    ctx.request.headers.authorization.split(' ')[1]
  ).id;

  const videoId = ctx.params.vId;
  let LCInfo = {
    like: false,
    collect: false,
  };

  const existingLikeData = await users_like.findOne({
    where: {
      user_id: userId,
      type: 'v',
      item_id: videoId,
    },
  });
  const existingCollectData = await users_collect.findOne({
    where: {
      user_id: userId,
      item_id: videoId,
    },
  });
  if (existingLikeData) LCInfo.like = true;
  if (existingCollectData) LCInfo.collect = true;
  ctx.body = {
    status: 200,
    message: '获取点赞和收藏成功',
    data: LCInfo,
    success: true,
  };
};

// 通过作者id获取作者投稿视频
exports.getVideoListByAuthorId = async (ctx, nxet) => {
  let author_id = ctx.query.authorId;
  let order;
  switch (ctx.params.order) {
    case '0':
      order = ['upload_date', 'DESC'];
      break;
    case '1':
      order = ['view_count', 'DESC'];
      break;
  }
  let result = await videos.findAll({
    where: {
      author_id,
    },
    order: [order],
    include: [
      {
        model: video_urls,
        attributes: ['video_id', 'resolution', 'url', 'video_cover'],
      },
      {
        model: wvv_users,
        attributes: ['username'],
      },
      {
        model: channellist,
        attributes: ['channel'],
      },
    ],
  });
  // 格式化返回的数据
  result = result.map((item) => {
    let { video_urls, wvv_user, channellist, id, brief, ...rest } =
      item.toJSON();
    return Object.assign(video_urls[0], wvv_user, channellist, rest);
  });

  ctx.body = {
    status: 200,
    message: '获取投稿视频成功',
    data: result,
    success: true,
  };
};

// 通过作者id获取作者收藏视频
exports.getCollectVideoByAuthorId = async (ctx, nxet) => {
  let author_id = ctx.query.authorId;
  let result = await users_collect.findAll({
    where: {
      user_id: author_id,
    },
    attributes: ['item_id', 'collection_time'],
  });
  let collectVideoList = [];
  await Promise.all(
    result.map(async (v) => {
      let res = await videos.findOne({
        where: {
          id: v.item_id,
        },
        include: [
          {
            model: video_urls,
            attributes: ['video_id', 'resolution', 'url', 'video_cover'],
          },
          {
            model: wvv_users,
            attributes: ['username'],
          },
          {
            model: channellist,
            attributes: ['channel'],
          },
        ],
      });
      res.upload_date = v.collection_time;
      collectVideoList.push(res);
    })
  );

  // 格式化返回的数据
  collectVideoList = collectVideoList.map((item) => {
    let { video_urls, wvv_user, channellist, id, brief, ...rest } =
      item.toJSON();
    return Object.assign(video_urls[0], wvv_user, channellist, rest);
  });
  ctx.body = {
    status: 200,
    message: '获取收藏视频成功',
    data: collectVideoList,
    success: true,
  };
};

// 通过作者id获取作者所有视频点赞和播放量总和
exports.getAllVideosLikeAndViewByAuthorId = async (ctx, nxet) => {
  const author_id = ctx.query.authorId;
  const result = await videos.findAll({
    where: {
      author_id,
    },
    attributes: [
      [sequelize.fn('sum', sequelize.col('view_count')), 'total_views'], // 求和 view_count 字段
      [sequelize.fn('sum', sequelize.col('like_count')), 'total_likes'], // 求和 like_count 字段
    ],
  });

  ctx.body = {
    status: 200,
    message: '获取点赞量和播放量成功',
    data: result,
    success: true,
  };
};

// 通过关键字搜索相关视频
exports.getSearchVideo = async (ctx, next) => {
  let keyword = ctx.query.keyword;
  let result = await videos.findAll({
    where: {
      title: {
        [Op.like]: `%${keyword}%`,
      },
    },
    include: [
      {
        model: video_urls,
        attributes: ['video_id', 'resolution', 'url', 'video_cover'],
      },
      {
        model: wvv_users,
        attributes: ['username'],
      },
      {
        model: channellist,
        attributes: ['channel'],
      },
    ],
  });
  // 格式化返回的数据;
  result = result.map((item) => {
    let { video_urls, wvv_user, channellist, id, brief, ...rest } =
      item.toJSON();
    return Object.assign(video_urls[0], wvv_user, channellist, rest);
  });
  ctx.body = {
    status: 200,
    message: '搜索成功',
    data: result,
    success: true,
  };
};

exports.getVideoCommentTotal = async (ctx, next) => {
  const { vId } = ctx.request.body;
  const total = await comment.count({
    where: { vId, type: 'v' },
  });
  const result = await videos.update(
    { review_count: total },
    {
      where: { id: vId },
    }
  );
  ctx.body = total;
};

exports.getFiveVideosOfChannel = async (ctx, next) => {
  // 此处channelId是一个数组;
  const channelId = ctx.request.body;
  const results = await Promise.all(
    channelId.map(async (Id) => {
      return await videos.findAll({
        where: { channel_id: Id },
        order: sequelize.literal('rand()'), // 使用 rand() 函数来随机排序
        attributes: [
          'duration',
          'like_count',
          'review_count',
          'title',
          'upload_date',
          'view_count',
          'author_id',
          'channel_id',
        ],
        include: [
          {
            model: video_urls,
            attributes: ['video_id', 'resolution', 'url', 'video_cover'],
          },
          {
            model: wvv_users,
            attributes: ['username'],
          },
          {
            model: channellist,
            attributes: ['channel'],
          },
        ],
        limit: 5, // 限制每个频道查询的结果数量为5条
      });
    })
  );
  const data = results.map((v) => {
    // 格式化返回的数据
    return (v = v.map((item) => {
      let { video_urls, wvv_user, channellist, ...rest } = item.toJSON();
      return Object.assign(video_urls[0], wvv_user, channellist, rest);
    }));
  });
  ctx.body = {
    success: true,
    status: 200,
    data,
    message: '获取各个频道5条数据成功',
  };
};

// ------------------视频管理------------------

// 更改投稿视频状态 0通过 1审核中 2未通过 3已删除
exports.changeVideoState = async (ctx) => {
  const { videoId, state } = ctx.request.body;
  console.log(videoId);
  // 根据videoId查询视频记录
  const video = await videos.findByPk(videoId);

  if (!video) {
    return ctx.cc('视频不存在');
  }

  // 更新状态
  video.state = state;
  await video.save();

  ctx.cc('操作成功', 200, true);
};

// 删除视频投稿
exports.deleteVideo = async () => {};

exports.getApprovedVideos = async (ctx) => {
  const { offset, limit } = ctx.query;
  const range = ctx.query.state || [0, 2];
  let result = await videos.findAndCountAll({
    where: { state: range },
    offset: (offset - 1) * limit,
    limit: limit - 0,
    order: [['id', 'DESC']],
    attributes: [
      'duration',
      'like_count',
      'review_count',
      'title',
      'upload_date',
      'view_count',
      'author_id',
      'channel_id',
      'state',
    ],
    include: [
      {
        model: video_urls,
        attributes: ['video_id', 'resolution', 'url', 'video_cover'],
      },
      {
        model: wvv_users,
        attributes: ['username'],
      },
      {
        model: channellist,
        attributes: ['channel'],
      },
    ],
  });
  // 格式化返回的数据
  result.rows = result.rows.map((item) => {
    let { video_urls, wvv_user, channellist, ...rest } = item.toJSON();
    return Object.assign(video_urls[0], wvv_user, channellist, rest);
  });
  ctx.body = {
    status: 200,
    message: result.length !== 0 ? '获取视频列表成功!' : '视频列表为空',
    total: result.count,
    data: result.rows,
    success: true,
  };
};
