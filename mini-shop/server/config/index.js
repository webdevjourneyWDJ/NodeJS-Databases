const bunyan = require('bunyan');

const appname = 'Mini Shop';

module.exports = {
  applicationName: appname,
  logger: bunyan.createLogger({ name: appname }),
};
