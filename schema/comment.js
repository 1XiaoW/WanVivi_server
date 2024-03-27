//导入验证规则的包
const joi = require('joi');

//定义用户名和密码的验证规则
const commentText = joi
  .string()
  .min(1)
  .required()
  .error(new Error('发布内容不能为空！'));
const userId = joi.number().required();
const vId = joi.number().required();
const contentType = joi.string();
const com_id = joi.string();

exports.comment_schema = joi.object({
  vId,
  userId,
  commentText,
  contentType,
  com_id,
});
