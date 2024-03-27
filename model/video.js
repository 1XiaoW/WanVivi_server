// video表结构化

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../core/db');
const { channellist } = require('./home');
const { wvv_users } = require('./user');

class videos extends Model {}
videos.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    upload_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    view_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    like_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    collect_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    review_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    channel_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brief: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    state: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'videos',
    timestamps: false,
  }
);
class video_urls extends Model {}
video_urls.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    video_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    resolution: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '1080p',
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    video_cover: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'video_urls',
    timestamps: false,
  }
);
// channellist 和 videos 之间的关联关系
channellist.hasMany(videos, { foreignKey: 'channel_id' });
videos.belongsTo(channellist, { foreignKey: 'channel_id' });
// videos 和 video_urls 之间的关联关系
videos.hasMany(video_urls, { foreignKey: 'video_id' });
video_urls.belongsTo(videos, { foreignKey: 'video_id' });
// videos 和 users 之间的关联关系
videos.belongsTo(wvv_users, { foreignKey: 'author_id' });
wvv_users.hasMany(videos, { foreignKey: 'author_id' });

module.exports = {
  video_urls,
  videos,
};
