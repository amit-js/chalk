var Logger = require("../logger");
var responseTime = require("response-time");
var uuidv4 = require("uuid/v4");

let cookieHandler = require("./cookieHandler");
let responseOverride = require("./responseOverrider");

let lynx = require("lynx");
let metrics = new lynx("localhost", 8125);

/**
 * PS: Here the order in which we add middleware is important.
 * @param expressApp
 */
module.exports = function(expressApp) {
  expressApp.use(requestStart);
  expressApp.use(cookieHandler);
  expressApp.use(responseOverride);

  expressApp.use(responseTimeLogger);
};

function requestStart(req, res, next) {
  // add the start time of request.
  req.startTime = process.hrtime();
  let reqId = uuidv4();

  req.reqId = reqId;

  res.setHeader("X-WP-REQ-ID", reqId);
  next();
}

function responseTimeLogger(req, res, next) {
  var startAt = req.startTime;

  res.on("finish", function onFinish() {
    try {
      var diff = process.hrtime(startAt);
      var time = diff[0] * 1e3 + diff[1] * 1e-6;
      time = +time.toFixed(2);

      Logger.info("access-log")
        .setExpressReq(req, true)
        .setResponseStatus(res.statusCode)
        .setTimeTakenMS(time)
        .log();

      var stat =
        req.method +
        "." +
        req.originalUrl
          .toLowerCase()
          .replace(/\/[0-9]+/g, "")
          .replace(/(?!^)([\/\.])(?!$)/gi, "_")
          .replace(/\//g, "")
          .replace(/\?.*$/g, "");
      metrics.timing("external." + stat, time);
      metrics.increment("external." + stat);

      switch (res.statusCode) {
        case 201:
        case 200:
        case 206:
        case 301:
        case 302:
          return;
        default:
          metrics.increment(
            "external_error_status." + stat + "." + res.statusCode
          );
      }
    } catch (ex) {
      console.error("got a crash in responseTimeLogger middleware");
      console.error(ex);
    }
  });

  next();
}
