/**
 * 请求时可能出现的错误
 */
class HttpException extends Error {
  constructor(msg = '服务器出错了', errCode = 10000, code = 500) {
    super();
    this.msg = msg;
    this.errCode = errCode;
    this.code = code;
  }
}

module.exports = {
  HttpException,
};
