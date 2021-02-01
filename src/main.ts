var cluster = require("cluster");
var log = require("./core/logger/mybunyan.js")("main-logger");

if (!process.env.ZK_URL) {
  throw new Error("ZK_URL is not present in env vars");
}

var messagePassingApi: any = {};
messagePassingApi.activeWorkerList = [];

messagePassingApi.refreshActiveWorkerList = function() {
  var newWorkers = Object.keys(cluster.workers);
  //Remove old/killed workers from active workers list
  for (var i = newWorkers.length - 1; i >= 0; i--) {
    if (messagePassingApi.activeWorkerList.indexOf(newWorkers[i]) === -1) {
      log.fatal(
        {
          workerid: newWorkers[i]
        },
        "Attaching onMessage event in Cluster Worker"
      );
      cluster.workers[newWorkers[i]].on(
        "message",
        messagePassingApi.onMessageHandler
      );
    }
  }
  log.fatal(
    {
      workers: newWorkers
    },
    "New Workers"
  );
  messagePassingApi.activeWorkerList = newWorkers;
};

messagePassingApi.onMessageHandler = function(msg) {
  //Handling the worker keys inside onmessage function as the array above may have been invalidated
  var newKeys = Object.keys(cluster.workers);
  for (var j = newKeys.length - 1; j >= 0; j--) {
    cluster.workers[newKeys[j]].send(msg);
  }
};
if (cluster.isMaster) {
  var numCPUs = require("os").cpus().length;
  // numCPUs = numCPUs > 12 ? 12 : numCPUs;

  //For dev machines
  if (process.env.NODE_ENV === "development") numCPUs = 1;

  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", function(worker, code, signal) {
    //Cluster worker exited.
    log.fatal(
      {
        error: "Worker EXITED!",
        worker: worker,
        code: code,
        signal: signal
      },
      "Cluster Worker EXITED due to some error!"
    );
    cluster.fork();
    messagePassingApi.refreshActiveWorkerList();
  });
  cluster.on("disconnect", function(worker) {
    log.fatal(
      {
        error: "Worker DISCONNECTED!",
        worker: worker
      },
      "Cluster Worker DISCONNECTED due to some error!"
    );
    // cluster.fork();
    // messagePassingApi.refreshActiveWorkerList();
  });
  //If any worker sends a message, the following code will take that message and send it across to all workers
  messagePassingApi.refreshActiveWorkerList();
} else {
  //Listen on port after initialising properties
  require("./server");
}
