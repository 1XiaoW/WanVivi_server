// home表结构初始化

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../core/db');

// banners表结构初始化
class banners extends Model {}
banners.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    sort_order: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'banners',
    timestamps: false,
  }
);
// banner_images表结构初始化
class banner_images extends Model {}
banner_images.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    image_url: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    tableName: 'banner_images',
    timestamps: false,
  }
);
// banners表拥有一个来自banner_images的外键'banner_id'
banners.hasOne(banner_images, { foreignKey: 'banner_id' });
/* belongsTo 方法中的 foreignKey 参数指定的是
Video 表中保存的频道（ChannelList）的外键，也就是 channel_id */
banner_images.belongsTo(banners, { foreignKey: 'banner_id' });

// channellist表结构初始化
class channellist extends Model {}
channellist.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    channel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'channellist',
    timestamps: false,
  }
);
module.exports = {
  banners,
  banner_images,
  channellist,
};
