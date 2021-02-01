import express from "express";
import App from "./app";

let expressApp = express();

let AppInstance = new App(expressApp);
AppInstance.initApp();
expressApp.listen(process.env.APP_PORT || 8080);
