// chat接口处理函数文件

// const db = require('../utils/db'); 更改数据库使用方式转为 sequelize
// 引入sequelize模型
const sequelize = require('../core/db');
const { Op } = require('sequelize');
const { chat } = require('../model/chat');
const { wvv_users } = require('../model/user');

exports.sendMessage = async (ctx, next) => {
  const { senderId, message, receiverId } = ctx.request.body;
  const res = await chat.create({
    senderId,
    message,
    receiverId,
    sendDate: new Date(),
  });
  ctx.cc('发送消息成功', 200, true);
};
exports.getAllMessage = async (ctx, next) => {
  const { senderId, receiverId } = ctx.query;
  let messages = await chat.findAll({
    where: {
      [Op.or]: [
        {
          [Op.and]: [{ senderId }, { receiverId }],
        },
        {
          [Op.and]: [{ receiverId: senderId }, { senderId: receiverId }],
        },
      ],
    },
    order: [['sendDate', 'ASC']],
  });

  const res = await wvv_users.findAll({
    where: {
      id: [senderId, receiverId],
    },
  });

  const projectMessages = messages.map((msg) => {
    return {
      fromSelf: msg.senderId === Number(senderId),
      message: msg.message,
      date: msg.sendDate,
      user_pic: res[0].id === msg.senderId ? res[0].user_pic : res[1].user_pic,
    };
  });

  ctx.body = {
    status: 200,
    message: '获取聊天记录成功',
    data: projectMessages,
    success: true,
  };
};

exports.getAllUserList = async (ctx, next) => {
  const receiverId = ctx.query.receiverId;
  let results = await chat.findAll({
    where: { receiverId },
    attributes: ['senderId'],
    group: ['senderId'],
    include: [
      {
        model: wvv_users,
        attributes: ['username', 'nickname', 'user_pic'],
        on: {
          // 指定关联条件
          senderId: sequelize.where(
            sequelize.col('wvv_user.id'),
            '=',
            sequelize.col('chat.senderId')
          ),
        },
      },
    ],
  });
  // 格式化返回数据
  results = results.map((item) => {
    let { wvv_user, ...rest } = item.toJSON();
    return Object.assign({}, rest, wvv_user);
  });
  ctx.body = {
    status: 200,
    message: '获取聊天用户成功',
    success: true,
    data: results,
  };
};
