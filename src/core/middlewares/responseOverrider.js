let Logger = require("../logger");

let async = require("async");

function IsNeededToProcess(req, res) {
  return req.bSessionModified || req.bSessionGenerated;
}

function ProcessBeforeSendingData(req, res, mainCallback) {
  async.parallel(
    [
      function(callback) {
        callback(null);
      },
      function(callback) {
        if (req.bSessionGenerated) {
          //Need to audit
          // audit.log({session: req.session, event: "Create"});
          req.bSessionGenerated = false;
        }
        callback(null);
      }
    ],
    mainCallback
  );
}

module.exports = function(req, res, next) {
  var bWIP = false;
  var arrData = [];
  var _writeRaw = res._writeRaw;
  res._writeRaw = function(data, encoding, callback) {
    if (bWIP) {
      arrData[arrData.length] = arguments;
      return false;
    }
    if (IsNeededToProcess(req, res)) {
      bWIP = true;
      arrData[arrData.length] = arguments;
      ProcessBeforeSendingData(req, res, processBeforeSendingDataCallback);
      return false;
    }
    return _writeRaw.call(res, data, encoding, callback);
  };

  var _socket = null;
  var _flushOutput = res._flushOutput;
  res._flushOutput = function(socket) {
    if (bWIP) {
      _socket = socket;
      return false;
    }
    if (IsNeededToProcess(req, res)) {
      _socket = socket;
      bWIP = true;
      ProcessBeforeSendingData(req, res, processBeforeSendingDataCallback);
      return false;
    }
    return _flushOutput.call(res, socket);
  };

  var processBeforeSendingDataCallback = function(bSuccess) {
    bWIP = false;
    while (arrData.length) {
      let argmts = arrData[0];
      arrData.splice(0, 1);
      _writeRaw.call(res, argmts[0], argmts[1], argmts[2]);
    }
    if (_socket) {
      _flushOutput.call(res, _socket);
      _socket = null;
    }
  };

  res.on("finish", function() {
    if (IsNeededToProcess(req, res)) {
      Logger.info(
        "[middleware:responseOverrider] error in overriding; response finished before processing changes"
      )
        .setExpressReq(req)
        .log();
    }
  });

  return next();
};
