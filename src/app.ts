//no d.ts available
var enrouten = require("express-enrouten");
import express, { Request, Response } from "express";
export default class App {
  app: any;
  /**
   *Creates an instance of App.
   * @memberof App
   */
  constructor(expressApp: any) {
    this.app = expressApp;
  }
  /**
   *
   *
   * @memberof App
   */
  initApp() {
    this.loadMiddleWares();
    this.loadHealthCheck();
    this.loadRoutes();
  }

  /**
   *
   *
   * @memberof App
   */
  loadMiddleWares() {
    let middlewares = require("./core/middlewares");
    middlewares(this.app);
  }
  /**
   *
   *
   * @memberof App
   */
  loadHealthCheck() {
    this.app.use("/spock/healthCheck", function(req: Request, res: Response) {
      res.status(200).send({ status: true });
    });
  }
  /**
   *
   *
   * @memberof App
   */
  loadRoutes() {
    this.app.use(
      "/api/",
      enrouten({
        directory: "./core/apis",
        routerOptions: {
          caseSensitive: true
        }
      })
    );
  }

  handleGlobalErrors() {
    this.app.use(function(err: any, req: any, res: any, next: any) {
      // Logger.error("Error handled through Express")
      //   .setError(err)
      //   .setExpressReq(req)
      //   .log();

      if (err && (err.status === 400 || err.status === 401)) {
        // res.status(400).render("./errorpage/error-400.html", err);
      } else if (err && err.status == 403) {
        // res.status(403).render("./errorpage/error-403.html");
      } else {
        // res.status(500).render("./errorpage/error-5xx.html");
      }
    });
  }
  static getExpressAppLoadedWithRoutes = function() {
    let expressApp = express();
    let app = new App(expressApp);
    app.initApp();
    return expressApp;
  };
}
