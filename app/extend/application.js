'use strict';
/**
 * 扩展egg.js 应用实例Application
 */
const RPCClient = require('@alicloud/pop-core').RPCClient;

function initVodClient(accessKeyId, accessKeySecret) {
  const regionId = 'cn-shanghai'; // 点播服务接入地域
  const client = new RPCClient({// 填入AccessKey信息
    accessKeyId,
    accessKeySecret,
    endpoint: 'http://vod.' + regionId + '.aliyuncs.com',
    apiVersion: '2017-03-21',
  });

  return client;
}
let vodClient = null;
module.exports = {
  get vodClient() {
    if (!vodClient) {
      const { accessKeyId, accessKeySecret } = this.config.vod;
      vodClient = initVodClient(accessKeyId, accessKeySecret);
    }
    return vodClient;
  },
};
