const { DataTypes, Model } = require('sequelize');
const sequelize = require('../core/db');
const { wvv_users } = require('./user');

class comment extends Model {}
comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    com_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    aut_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    like_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    reply_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    pubdate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_top: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_liking: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'comments',
    timestamps: false,
  }
);

// wvv_users 和 comment 之间的关联关系
wvv_users.hasMany(comment, { foreignKey: 'aut_id' });
comment.belongsTo(wvv_users, { foreignKey: 'aut_id' });

module.exports = { comment };
