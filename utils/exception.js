/**
 * 全局监听请求错误
 */

// 引入请求异常文件
const { HttpException } = require('../core/http-exception');

const catchErr = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.log(error);
    if (error.name === 'UnauthorizedError') {
      // 针对身份认证失败的错误，返回特定的错误信息
      ctx.body = {
        msg: '身份认证失败！',
        errCode: 401,
        request: `${ctx.method} ${ctx.path}`,
      };
      ctx.status = 401;
      return;
    }
    // 判断是否为已知请求错误
    const isHttpException = error instanceof HttpException ? true : false;
    // 如果不是返回原始错误信息
    if (!isHttpException) return ctx.cc(error);
    if (isHttpException) {
      ctx.body = {
        msg: error.msg,
        errCode: error.errCode,
        request: `${ctx.method} ${ctx.path}`,
      };
      ctx.status = 400;
    } else {
      ctx.body = {
        msg: '遇到未知错误!',
        errCode: 50200,
        request: `${ctx.method} ${ctx.path}`,
      };
      ctx.status = 502;
    }
  }
};

module.exports = {
  catchErr,
};
