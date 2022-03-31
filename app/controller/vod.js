'use strict';
// const RPCClient = require('@alicloud/pop-core').RPCClient;
const Controller = require('egg').Controller;

// function initVodClient(accessKeyId, accessKeySecret) {
//   const regionId = 'cn-shanghai'; // 点播服务接入地域
//   const client = new RPCClient({// 填入AccessKey信息
//     accessKeyId,
//     accessKeySecret,
//     endpoint: 'http://vod.' + regionId + '.aliyuncs.com',
//     apiVersion: '2017-03-21',
//   });

//   return client;
// }

class VodClient extends Controller {
  async createUploadVideo() {
    const query = this.ctx.query;
    this.ctx.validate({
      Title: { type: 'string' },
      FileName: { type: 'string' },
    }, query);
    // const vodClient = initVodClient('', '');

    this.ctx.body = await this.app.vodClient.request('CreateUploadVideo', query, {});
  }
  async refreshUploadVideo() {
    const query = this.ctx.query;
    this.ctx.validate({
      VideoId: { type: 'string' },
    }, query);
    // const vodClient = initVodClient('', '');

    this.ctx.body = await this.app.vodClient.request('RefreshUploadVideo', query, {});
  }
}
module.exports = VodClient;
