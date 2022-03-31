'use strict';
const Serive = require('egg').Service;
const jwt = require('jsonwebtoken');

class UserService extends Serive {
  get User() {
    return this.app.model.User;
  }
  findByUsername(username) {
    // this.app.model.User;
    return this.User.findOne({
      username,
    });
  }

  findByEmail(email) {
    return this.User.findOne({
      email,
    }).select('+password');
  }

  async createUser(data) {
    data.password = this.ctx.helper.md5(data.password);
    const user = new this.User(data);
    await user.save();
    return user;
  }

  createToken(data) {
    return jwt.sign(data, this.app.config.jwt.secret);
  }

  verifyToken(token) {
    return jwt.verify(token, this.app.config.jwt.secret);
  }
  updateUser(data) {
    return this.User.findByIdAndUpdate(this.ctx.user._id, data, {
      new: true, // 返回更新之后的数据
    });
  }
  async subscribe(userId, channelId) {
    const { Subscription } = this.app.model;
    // 1. 检查是否已经订阅
    const record = await Subscription.findOne({
      user: userId,
      channel: channelId,
    });
    const user = await this.User.findById(channelId);
    // 2. 没有订阅，添加订阅
    if (!record) {
      new Subscription({
        user: userId,
        channel: channelId,
      }).save();
    }
    user.subscribersCount++; // 更新用户订阅数量
    await user.save(); // 更新到数据库
    // 3. 返回用户信息

    return user;
  }
  async unsubscribe(userId, channelId) {
    const { Subscription } = this.app.model;
    // 1. 检查是否已经订阅
    const record = await Subscription.findOne({
      user: userId,
      channel: channelId,
    });
    const user = await this.User.findById(channelId);
    // 2. 没有订阅，添加订阅
    if (record) {
      await record.remove();
      user.subscribersCount--; // 更新用户订阅数量
      await user.save();
    }
    // 3. 返回用户信息

    return user;
  }
}
module.exports = UserService;
