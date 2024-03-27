const { DataTypes, Model } = require('sequelize');
const sequelize = require('../core/db');
const { videos } = require('./video');

// users_collect表初始化结构
class users_collect extends Model {}
users_collect.init(
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
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    collection_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users_collect',
    timestamps: false,
  }
);

users_collect.addHook('beforeCreate', async (collect, options) => {
  // 在创建收藏记录之前，找到对应的视频并更新收藏数量
  const video = await videos.findByPk(collect.item_id);
  if (video) {
    video.collect_count += 1;
    await video.save();
  }
});

users_collect.addHook('beforeDestroy', async (collect, options) => {
  // 在删除收藏记录之前，找到对应的视频并更新收藏数量
  const video = await videos.findByPk(collect.item_id);
  if (video) {
    video.collect_count -= 1;
    await video.save();
  }
});

module.exports = {
  users_collect,
};
