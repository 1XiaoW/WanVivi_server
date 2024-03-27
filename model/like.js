const { DataTypes, Model } = require('sequelize');
const sequelize = require('../core/db');
const { videos } = require('./video');

// users_like表初始化结构
class users_like extends Model {}
users_like.init(
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users_like',
    timestamps: false,
  }
);

users_like.addHook('beforeCreate', async (like, options) => {
  // 在创建点赞记录之前，找到对应的视频并更新点赞数量
  const video = await videos.findByPk(like.item_id);
  if (video) {
    video.like_count += 1;
    await video.save();
  }
});

users_like.addHook('beforeDestroy', async (like, options) => {
  // 在删除点赞记录之前，找到对应的视频并更新点赞数量
  const video = await videos.findByPk(like.item_id);
  if (video) {
    video.like_count -= 1;
    await video.save();
  }
});

module.exports = {
  users_like,
};
