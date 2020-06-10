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
  },
  mysql:{
    options: {
      host: 'localhost',
      port: '4306',
      database: 'miniShop',
      dialect: 'mysql',
      username: 'root',
      password: 'password'
    }
  }
};
