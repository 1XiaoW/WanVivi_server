const { Op } = require('sequelize');
// 引入模型
const { message } = require('../model/message');
const { wvv_users } = require('../model/user');

// 发布消息
exports.publishMessage = async (ctx, next) => {
  const { message_title, message_category, message_content, publisher } =
    ctx.request.body;
  const message_publish_time = new Date();

  // 使用 Sequelize 的 create 方法插入新数据
  const result = await message.create({
    message_title,
    publisher,
    message_category,
    message_content,
    message_publish_time,
    message_status: 0,
  });
  if (result.id) {
    await wvv_users.update({ unread_message: 1 }, { where: {} });
    ctx.body = {
      status: 200,
      message: '发布消息成功',
      success: true,
      id: result.id,
    };
  } else ctx.cc('发布信息失败');
};

// 按信息分类获取信息列表
exports.getMessage = async (ctx, next) => {
  const { message_category, offset, limit } = ctx.query;
  const result = await message.findAndCountAll({
    where: {
      message_category,
    },
    order: [['id', 'DESC']],
    offset: (offset - 1) * limit,
    limit: limit - 0,
  });
  ctx.body = {
    status: 200,
    message: '获取消息成功',
    success: true,
    total: result.count,
    data: result.rows,
  };
};

// 修改信息
exports.updateMessage = async (ctx, next) => {
  const { id, message_title, message_category, message_content, publisher } =
    ctx.request.body;
  const message_update_time = new Date();

  // 使用 Sequelize 的 update 方法更新数据
  const result = await message.update(
    {
      message_title,
      publisher,
      message_category,
      message_content,
      message_update_time,
    },
    {
      where: {
        id,
      },
    }
  );
  if (result[0] === 1) {
    await wvv_users.update({ unread_message: 1 }, { where: {} });
    ctx.body = {
      status: 200,
      message: '修改信息成功',
      success: true,
    };
  } else {
    ctx.cc('修改信息失败');
  }
};

// 删除信息
exports.deleteMessage = async (ctx, next) => {
  const { message_id } = ctx.query;
  // 使用 Sequelize 的 destroy 方法删除数据
  const result = await message.destroy({
    where: {
      id: message_id,
    },
  });

  if (result === 1) {
    ctx.body = {
      status: 200,
      message: '删除信息成功',
      success: true,
    };
  } else {
    ctx.cc('删除信息失败');
  }
};

// 按照消息标题进行模糊查找
exports.searchByTitle = async (ctx, next) => {
  const { title } = ctx.query;

  // 使用 Sequelize 的 findAll 方法查询数据
  const result = await message.findAll({
    where: {
      message_title: {
        [Op.like]: `%${title}%`,
      },
    },
  });
  console.log(result);
  if (result.length !== 0)
    ctx.body = {
      status: 200,
      message: '查询成功',
      success: true,
      data: result,
    };
  else {
    ctx.cc('暂无更多');
  }
};
