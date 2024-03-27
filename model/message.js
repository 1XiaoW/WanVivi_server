const { DataTypes, Model } = require('sequelize');
const sequelize = require('../core/db');

class message extends Model {}
message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    message_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message_category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message_content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publisher: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message_publish_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    message_update_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    message_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'message',
    timestamps: false,
  }
);

module.exports = {
  message,
};
