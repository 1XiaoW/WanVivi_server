// const db = require('../utils/db');
const path = require('path');
const fs = require('fs');
// 导入bcryptjs这个包
const bcrypt = require('bcryptjs');
// 导入token工具
const token = require('../utils/token');
// 导入发送邮件包
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');
// 解构出joi对象(包含设定好的校验规则)
const {
  reg_login_schema,
  update_userinfo_schema,
  password,
} = require('../schema/user');
// 解构出wvv_users模型
const { wvv_users } = require('../model/user');
const { users_dynamic } = require('../model/dynamic');

const { QueryTypes, Op } = require('sequelize');
const sequelize = require('../core/db');

exports.reguser = async (ctx, next) => {
  try {
    // 校验请求体里的参数成功就解构出里面的数据
    const { username, password } = await reg_login_schema.validateAsync(
      ctx.request.body
    );
    // 查找wvv_users表中 username=username的数据 ES6key-value相同 可直接写成key
    // let userinfo = await wvv_users.findAll({
    //   where: {
    //     username,
    //   },
    // });
    // 上面注释掉的代码不区分大小写，故此换下面方法
    const userinfo = await sequelize.query(
      'SELECT * FROM wvv_users WHERE BINARY username = :username',
      {
        replacements: { username },
        type: QueryTypes.SELECT,
        model: wvv_users,
        mapToModel: true,
      }
    );
    console.log(userinfo);
    console.log(username, password);
    // 如果数据库中已有数据，代表已经被注册过了
    if (userinfo.length > 0) {
      return ctx.cc('用户名被占用，请更换其他用户名!');
    }
    //调用bcrypt.hashSync()对密码进行加密
    const hash_password = bcrypt.hashSync(password, 10);
    // 向wvv_users表中插入数据
    await wvv_users.create({
      username,
      password: hash_password,
      role: '普通用户',
      reg_date: new Date(),
    });
    ctx.cc('注册成功!', 200, true);
  } catch (error) {
    return ctx.cc(error);
  }
};

exports.login = async (ctx, next) => {
  // 校验请求体里的参数成功就解构出里面的数据
  const { username, password } = await reg_login_schema.validateAsync(
    ctx.request.body
  );
  // 查找wvv_users表中 username=username的数据
  /* const userinfo = await wvv_users.findAll({
    where: {
      username: {
        [Op.eq]: username,
      },
    },
  }); */

  // 上面注释掉的代码不区分大小写，故此换下面方法
  const userinfo = await sequelize.query(
    'SELECT * FROM wvv_users WHERE BINARY username = :username',
    {
      replacements: { username },
      type: QueryTypes.SELECT,
      model: wvv_users,
      mapToModel: true,
    }
  );
  // 如果查询出来的数据长度不为1，代表没有从数据中获取到数据
  if (userinfo.length !== 1) return ctx.cc('登录失败,未找到该用户!');
  // 将传过来的密码和数据库中加盐的密码进行比对，返回布尔值 相同为true 反之
  const comparaResult = bcrypt.compareSync(password, userinfo[0].password);
  // 如果comparaResult为false 将直接返回登录失败
  if (!comparaResult) return ctx.cc('登录失败,密码不正确!');
  // 所有信息比对完成，没有问题开始重构(将一些敏感信息进行处理)返回来的数据作为token的字符串
  const user = { ...userinfo[0].toJSON(), password: '' };
  // 将user信息进行token转换，jwSecretKey是自定义的密钥，expiresIn是token的有效期
  const tokenStr = token.setToken(user);
  ctx.body = {
    status: 200,
    message: '登录成功！',
    data: {
      userId: userinfo[0].id,
      username: userinfo[0].username,
      token: 'Bearer ' + tokenStr,
      avatar: userinfo[0].user_pic,
      unread_message: userinfo[0].unread_message,
      role: userinfo[0].role,
    },
    success: true,
  };
};

exports.getUserInfo = async (ctx, next) => {
  let rId = ctx.params.id;
  if (rId >= 0 || rId == -1) {
    let where =
      rId == -1
        ? ''
        : {
            where: {
              id: rId,
            },
          };

    let result = await wvv_users.findAll({
      ...where,
      attributes: [
        'id',
        'username',
        'user_pic',
        'reg_date',
        'nickname',
        'email',
      ],
    });
    if (result.length !== 0) {
      ctx.body = {
        status: 200,
        message: '获取用户信息成功',
        data: result,
        success: true,
      };
    } else {
      ctx.body = {
        status: 401,
        message: '无该用户信息',
        success: true,
      };
    }
  } else {
    ctx.cc('请输入正确的id');
  }
};

exports.getReadState = async (ctx, next) => {
  let id = ctx.params.id;
  const result = await wvv_users.findAll({
    where: {
      id,
    },
    attributes: ['unread_message'],
  });
  ctx.body = {
    status: 200,
    message: '获取用户消息阅读状态成功',
    unread_message: result[0].unread_message,
    success: true,
  };
};

exports.putUserInfo = async (ctx, next) => {
  const userId = parseInt(ctx.params.id);
  // 校验请求体里的参数成功就解构出里面的数据
  console.log(ctx.request.body.code);
  const { nickname, email, code } = await update_userinfo_schema.validateAsync(
    ctx.request.body
  );
  // 根据 userId 查询需要修改的用户
  const user = await wvv_users.findByPk(userId);
  if (user.email !== email) {
    const hasCode = await ctx.redis.get(`code${email}`);
    if (hasCode) {
      if (hasCode != code) {
        ctx.cc('验证码错误，请重试');
        return;
      }
    } else {
      ctx.cc('邮箱发生更改，请获取新邮箱的验证码输入');
      return;
    }
  }
  if (!user) {
    // 如果用户不存在，返回 404 状态码
    ctx.cc('用户不存在');
    return;
  }
  // 更新用户信息
  if (nickname) {
    user.nickname = nickname;
  }
  if (email) {
    user.email = email;
  }
  await user.save();
  await ctx.redis.delete(`code${email}`);
  // 返回操作成功的消息
  ctx.cc('用户信息更改成功', 200, true);
};

exports.putUserAvatar = async (ctx, next) => {
  const userId = ctx.params.id;
  const file = ctx.request.files.file;
  if (!file) {
    return ctx.cc('头像上传失败');
  } else {
    const fileName = `${Date.now()}_${file.originalFilename}`;
    // 指定文件保存路径
    const filePath = path.resolve(
      __dirname,
      '../assets/images/user/avatar',
      fileName
    );
    //   console.log(filePath);
    await new Promise((resolve, reject) => {
      const reader = fs.createReadStream(file.filepath);
      const writer = fs.createWriteStream(filePath);

      // 监听写入完成事件，发送响应
      writer.on('finish', () => {
        ctx.body = '文件上传成功';
        fs.unlinkSync(file.filepath); // 删除临时文件
        resolve(); // 完成后 resolve Promise
      });

      // 监听写入出错事件，发送错误响应
      writer.on('error', (err) => {
        ctx.body = '文件上传失败';
        console.error(err);
        reject(err); // 出错时 reject Promise
      });

      reader.pipe(writer);
    });

    //   // 数据库储存头像文件保存路径
    const fileUrl = path.join('/images/user/avatar', fileName);
    await wvv_users.update(
      {
        user_pic: fileUrl,
      },
      {
        where: {
          id: userId,
        },
      }
    );
    ctx.body = {
      status: 200,
      message: '头像更新成功',
      fileUrl,
      success: true,
    };
  }
};

exports.putUserSign = async (ctx, next) => {
  const userId = ctx.params.id;
  const signature = ctx.request.body.sign;
  await wvv_users.update(
    {
      signature,
    },
    {
      where: {
        id: userId,
      },
    }
  );
  ctx.body = {
    status: 200,
    message: '签名更新成功',
    success: true,
  };
};

exports.putUserPwd = async (ctx, next) => {
  const userId = ctx.params.id;
  const { originPwd, confirmPwd } = ctx.request.body;
  const userInfo = await wvv_users.findOne({
    where: {
      id: userId,
    },
  });
  if (!userInfo.password) return ctx.cc('未找到此用户信息');
  const comparaResult = bcrypt.compareSync(originPwd, userInfo.password);
  if (!comparaResult) return ctx.cc('修改失败,原密码不正确!');
  await password.validateAsync(confirmPwd);
  const hash_password = bcrypt.hashSync(confirmPwd, 10);
  await wvv_users.update(
    {
      password: hash_password,
    },
    { where: { id: userId } }
  );
  ctx.body = {
    status: 200,
    message: '修改用户密码成功',
    success: true,
  };
};

exports.getOtherUserInfo = async (ctx, next) => {
  const { offset, limit } = ctx.query;
  let rId = ctx.params.id;
  if (rId >= 0 || rId == -1) {
    let where =
      rId == -1
        ? ''
        : {
            where: {
              id: rId,
            },
          };
    let result = await wvv_users.findAndCountAll({
      ...where,
      order: [['reg_date', 'DESC']],
      offset: (offset - 1) * limit,
      limit: limit - 0,
      attributes: [
        'id',
        'username',
        'user_pic',
        'reg_date',
        'nickname',
        'email',
        'signature',
      ],
    });
    if (result.length !== 0) {
      ctx.body = {
        status: 200,
        message: '获取用户信息成功',
        total: result.count,
        data: result.rows,
        success: true,
      };
    } else {
      ctx.body = {
        status: 404,
        message: '无该用户信息',
        success: true,
      };
    }
  } else {
    ctx.cc('请输入正确的id');
  }
};

exports.putReadMsgState = async (ctx, next) => {
  const userId = ctx.params.id;
  const user = await wvv_users.findByPk(userId);
  if (!user) {
    throw new Error(`不能找到此用户，ID： ${userId}`);
  }
  await user.update({ unread_message: 0 });
  ctx.cc('修改阅读状态成功', 200, true);
};

exports.getDynamic = async (ctx, next) => {
  const id = ctx.params.id;
  const results = await users_dynamic.findAll({
    where: { user_id: id },
  });
  ctx.body = {
    message: '获取动态成功',
    status: 200,
    data: results,
    success: true,
  };
};

exports.addDynamic = async (ctx, next) => {
  const id = ctx.params.id;
  const { text } = ctx.request.body;
  await users_dynamic.create({
    user_id: id,
    dynamic_text: text,
    date: new Date(),
  });
  ctx.cc('发布动态成功', 200, true);
};

exports.deleteDynamic = async (ctx, next) => {
  const id = ctx.params.id;

  await users_dynamic.destroy({
    where: { user_id: id },
  });
  ctx.cc('删除动态成功', 200, true);
};

exports.searchByUsername = async (ctx, next) => {
  const { username } = ctx.query;
  // 使用 Sequelize 的 findAll 方法查询数据
  const result = await wvv_users.findAll({
    where: {
      username: {
        [Op.like]: `%${username}%`,
      },
    },
    attributes: ['username', 'nickname', 'email', 'reg_date', 'signature'],
  });
  if (result.length !== 0)
    ctx.body = {
      status: 200,
      message: '查询成功',
      success: true,
      data: result,
    };
  else {
    ctx.cc('暂无更多');
  }
};

exports.deleteUser = async (ctx, next) => {
  const { userId } = ctx.query;
  // 使用 Sequelize 的 destroy 方法删除数据
  const result = await wvv_users.destroy({
    where: {
      id: userId,
    },
  });

  if (result === 1) {
    ctx.body = {
      status: 200,
      message: '删除用户成功',
      success: true,
    };
  } else {
    ctx.cc('删除用户失败');
  }
};

exports.sendCode = async (ctx, next) => {
  const { email } = ctx.request.body;
  const randomCode = crypto.randomBytes(2).toString('hex').toUpperCase();
  // HTML邮件模板
  const htmlTemplate = `  
<!DOCTYPE html>  
<html lang="en">  
<head>  
    <meta charset="UTF-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  
    <title>验证码邮件</title>  
    <style>  
        body {  
            font-family: Arial, sans-serif;  
            margin: 0;  
            padding: 0;  
            background-color: #f4f4f4;  
        }  
        .container {  
            max-width: 600px;  
            margin: 0 auto;  
            background-color: #fff;  
            padding: 30px;  
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);  
            margin-top: 50px;  
            margin-bottom: 50px;  
        }  
        h1 {  
            text-align: center;  
        }  
        p {  
            margin-top: 20px;  
        }  
    </style>  
</head>  
<body>  
    <div class="container">  
        <h1>欢迎来到我们的网站！</h1>  
        <p>请使用以下验证码完成验证：</p>  
        <p style="font-size: 20px; font-weight: bold; color: #3498db;"><!--VERIFICATION_CODE--></p>  
        <p>如果您没有请求此验证码，请忽略此邮件。</p>  
    </div>  
</body>  
</html>  
`;

  const res = await sendEmail(email, '您的验证码', htmlTemplate, randomCode);
  if (res === 200) {
    ctx.redis.set(`code${email}`, randomCode, 300);
    ctx.cc('发送验证码成功', 200, true);
  }
};
