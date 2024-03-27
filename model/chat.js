const { DataTypes, Model } = require('sequelize');
const sequelize = require('../core/db');
const { wvv_users } = require('./user');

class chat extends Model {}

chat.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 注意：这里假设文本内容直接存储在`text`字段中
    sendDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'chat',
    timestamps: false,
  }
);

wvv_users.hasMany(chat, { foreignKey: 'senderId' });
wvv_users.hasMany(chat, { foreignKey: 'receiverId' });
chat.belongsTo(wvv_users, { foreignKey: 'senderId' });
chat.belongsTo(wvv_users, { foreignKey: 'receiverId' });

module.exports = { chat };
