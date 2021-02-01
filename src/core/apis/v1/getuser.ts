import { Request, Response } from "express";
import jsonParser from "body-parser";
import createLogger from "../../logger/mybunyan";
const logger = createLogger("randomiser");
import sqlHelper from "../../database";
interface RequestI extends Request {
  session: any;
  message: any;
}
const getuser = (req: RequestI, res: Response) => {
  logger.info(req.session, "getABPath: Request received!");
  sqlHelper.executeQuery("select * from user", (error, result) => {
    if (error) {
      logger.error({ error }, "getUser: !!! Response Error !!!");
      res.status(422).send(error);
    } else {
      logger.info({ result }, "getUser: Response Success!");
      res.status(200).send(result);
    }
  });
};
export default function(router: any) {
  router.post("/", jsonParser.json(), getuser);
}
