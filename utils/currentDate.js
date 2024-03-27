// 创建 Date 对象表示当前日期
const currentDate = new Date();

// 获取当前时间工具
// 获取年、月、日
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const day = String(currentDate.getDate()).padStart(2, '0');
const hours = String(currentDate.getHours()).padStart(2, '0');
const minutes = String(currentDate.getMinutes()).padStart(2, '0');
const seconds = String(currentDate.getSeconds()).padStart(2, '0');

// 格式化为 "YYYY-MM-DD" 字符串
const formattedDate = `${year}-${month}-${day}`;

// 格式化为 "YYYY-MM-DD HH:MM:SS" 字符串
const formattedDate2 = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

// console.log(formattedDate); // 输出：YYYY-MM-DD

module.exports = formattedDate2;
