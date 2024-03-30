const { comment } = require('../model/comment');
const { wvv_users } = require('../model/user.js');
const { comment_schema } = require('../schema/comment.js');

exports.getComment = async (ctx, next) => {
  let { type, source, offset, limit } = ctx.query;
  let com_id = ctx.params.com_id;
  let queryWhere = {
    type: type,
    vid: source,
  };
  if (com_id !== 'undefined') queryWhere.com_id = com_id;

  let totalCount = await comment.count({
    where: {
      ...queryWhere,
    },
  });

  let result = await comment.findAll({
    where: {
      ...queryWhere,
    },
    order: [['id', 'DESC']],
    include: [
      {
        model: wvv_users,
        attributes: ['username', 'nickname', 'user_pic'],
      },
    ],
    offset: (offset - 1) * limit,
    limit: limit - 0,
  });

  // 格式化返回数据
  result = result.map((item) => {
    let { wvv_user, ...rest } = item.toJSON();
    return Object.assign({}, rest, wvv_user);
  });
  if (result.length > 0)
    ctx.body = {
      status: 200,
      message: '获取评论成功!',
      data: {
        total: totalCount,
        page: Number(offset),
        result,
      },
      success: true,
    };
  else
    ctx.body = {
      status: 200,
      message: '暂无更多数据了',
      success: true,
    };
};

exports.postComment = async (ctx, next) => {
  const { userId, vId, commentText, contentType, com_id } =
    await comment_schema.validateAsync(ctx.request.body);
  const data = {
    aut_id: userId,
    content: commentText,
    type: contentType ? contentType : 'v',
    vid: vId,
    pubdate: new Date(),
    com_id,
  };
  let res = await comment.create(data);
  console.log(res.dataValues);
  ctx.body = {
    data: res.dataValues,
    message: '发布评论成功！',
    status: 200,
    success: true,
  };
  // ctx.cc('发布评论成功！', 200, true);
};

// 获取所有评论
exports.getAllComment = async (ctx, next) => {
  let { offset, limit } = ctx.query;

  let result = await comment.findAndCountAll({
    order: [['id', 'DESC']],
    include: [
      {
        model: wvv_users,
        attributes: ['username', 'nickname', 'user_pic'],
      },
    ],
    offset: (offset - 1) * limit,
    limit: limit - 0,
  });

  // 格式化返回数据
  result.rows = result.rows.map((item) => {
    let { wvv_user, ...rest } = item.toJSON();
    return Object.assign({}, rest, wvv_user);
  });
  if (result.count > 0)
    ctx.body = {
      status: 200,
      message: '获取评论成功!',
      total: result.count,
      data: result.rows,
      success: true,
    };
  else
    ctx.body = {
      status: 200,
      message: '暂无更多数据了',
      success: true,
    };
};

// 删除信息
exports.deleteComment = async (ctx, next) => {
  const { id } = ctx.query;
  const comType = await comment.findByPk(id);
  let result;
  if (comType && comType.type === 'v') {
    // 使用 Sequelize 的 destroy 方法删除数据
    result = await comment.destroy({
      where: {
        com_id: comType.com_id,
      },
    });
  } else {
    result = await comment.destroy({
      where: {
        id,
      },
    });
  }
  if (result >= 1) {
    ctx.body = {
      status: 200,
      message: '删除评论成功',
      success: true,
    };
  } else {
    ctx.cc('删除评论失败');
  }
};
