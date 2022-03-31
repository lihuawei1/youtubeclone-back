'use strict';
module.exports = (option = { required: true }) => {
  return async (ctx, next) => {
    // 1. 获取请求头中的token 数据
    let token = ctx.header.authorization;
    token = token ? token.split('Bearer ')[1] : null;
    if (token) {
      try {
        // 3. token有效，根据userId获取用户数据挂载到ctx对象中给后续中间件使用
        const data = await ctx.service.user.verifyToken(token);
        ctx.user = await ctx.model.User.findById(data.userId);
      } catch (err) {
        ctx.throw(401);
      }
      // 2. 验证token，无效 401
    } else if (option.required) {
      ctx.throw(401);
    }


    // 4. next 执行后续中间件
    await next();
  };
};
