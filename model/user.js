// user表结构初始化

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../core/db');

// wvv_users表初始化结构
class wvv_users extends Model {}
wvv_users.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_pic: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reg_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    signature: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    unread_message: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'wvv_users',
    timestamps: false,
  }
);

module.exports = {
  wvv_users,
};
