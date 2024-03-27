// home接口处理函数文件

// const db = require('../utils/db'); 更改数据库使用方式转为 sequelize
// 引入sequelize模型
const { banners, banner_images, channellist } = require('../model/home');

// 测试错误用
// const { HttpException } = require('../core/http-exception');
exports.getChannelList = async (ctx, next) => {
  //   const sql = 'select * from channellist';
  //   let result = await new Promise((resolve, reject) => {
  //     return db.query(sql, (err, data) => {
  //       if (err) return ctx.cc(err);
  //       resolve(data);
  //     });
  //   });

  // throw new HttpException();
  let result = await channellist.findAll(); // 查找channellist表里所有数据
  ctx.body = {
    status: 200,
    message: '获取频道列表成功!',
    data: result,
    success: true,
  };
};

exports.getCarouselInfo = async (ctx, next) => {
  /* const sql = `select banners.id,title,sort_order,image_url FROM banners,banner_images WHERE banners.id=banner_images.banner_id`;
  let result = await new Promise((resolve, reject) => {
    return db.query(sql, (err, data) => {
      if (err) return ctx.cc(err);
      resolve(data);
    });
  }); */

  // 获取banners表的所有数据和banner_images表里的image_url数据 (受主键外键绑定)
  let result = await banners.findAll({
    order: [['sort_order', 'ASC']],
    include: [
      {
        model: banner_images,
        attributes: ['image_url', 'bottom_color'],
      },
    ],
  });
  // 格式化结果，达到想要的格式
  result = result.map((item) => {
    let { banner_image, ...rest } = item.toJSON();
    return Object.assign({}, rest, banner_image);
  });
  ctx.body = {
    status: 200,
    message: '获取轮播图信息成功！',
    data: result,
    success: true,
  };
};
