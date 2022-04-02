/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1648003672243_8894';

  // add your middleware config here
  config.middleware = [ 'errorHandller' ];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };
  config.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1/youtube-clone',
      options: {
        useUnifiedTopology: true,
      },
      // mongoose global plugins, expected a function or an array of function and options
      plugins: [],
    },
  };
  config.security = {
    csrf: {
      enable: false,
    },
  };
  config.jwt = {
    secret: '157b737f-20c1-435a-9415-9f66a4339962',
    expiresIn: '1d',
  };
  config.cors = {
    origin: '*',
  };
  config.cluster = {
    listen: {
      port: 7001,
      hostname: '127.0.0.1',
    },
  };
  return {
    ...config,
    ...userConfig,
  };
};
