const { DataTypes, Model } = require('sequelize');
const sequelize = require('../core/db');

// users_dynamic表初始化结构
class users_dynamic extends Model {}
users_dynamic.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dynamic_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users_dynamic',
    timestamps: false,
  }
);

module.exports = {
  users_dynamic,
};
