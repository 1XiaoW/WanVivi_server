// 数据库连接工具
const mysql = require('mysql');

// 数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'admin123',
  database: 'wanvivi',
});

// 对数据库进行增删改查操作的基础
function query(sql, callback) {
  pool.getConnection(function (err, connection) {
    connection.query(sql, function (err, rows) {
      callback(err, rows);
      connection.release();
    });
  });
}

exports.query = query;
