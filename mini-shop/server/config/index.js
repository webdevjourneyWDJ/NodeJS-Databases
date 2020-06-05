const bunyan = require('bunyan');

const appname = 'Mini Shop';

module.exports = {
  applicationName: appname,
  logger: bunyan.createLogger({ name: appname }),
  mongodb: {
    dsn: 'mongodb://localhost:37017/miniShop'
  },
  redis: {
    options: {
      port: 7379
    }
  }
};
