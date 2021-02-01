var bunyan = require("bunyan");
var myLogger = null;

module.exports = function(name) {
  var func = {};

  if (myLogger === null) {
    myLogger = bunyan.createLogger({
      name: "spock",
      serializers: bunyan.stdSerializers,
      streams: [
        {
          stream: process.stdout,
          level: "info"
        },
        {
          stream: process.stderr,
          level: "fatal"
        }
      ]
    });
  }

  func.info = myLogger.info.bind(myLogger);
  func.error = myLogger.error.bind(myLogger);
  func.fatal = myLogger.fatal.bind(myLogger);

  return func;
};
