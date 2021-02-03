import { Request, Response } from "express";
import jsonParser from "body-parser";
import createLogger from "../../../logger/mybunyan";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { verifyToken } from "../../../util/auth";
const logger = createLogger("auth");

interface RequestI extends Request {
  session: any;
  message: any;
}
const sendOtp = (req: RequestI, res: Response) => {
  logger.info(req.session, "getUser: Request received!");
  const phone = req.body.phone;
  const otp = req.body.otp;
  let [hash, expires] = req.body.hash.split(".");

  if (Date.now() > expires) {
    res.status(504).send("OTP expired");
  }

  const data = `${phone}.${otp}.${expires}`;
  const newHash = crypto
    .createHash("md5")
    .update(data)
    .digest("hex");

  if (hash === newHash) {
    const token = jwt.sign({ phone }, process.env.JWT_AUTH_TOKEN, {
      expiresIn: "1800s"
    });
    res
      .cookie("ssid", token, {
        expires: new Date(Date.now() + 10000)
      })
      .status(200)
      .send("OTP verified");
  } else {
    res.status(401).send("Incorrect");
  }
};
export default function(router: any) {
  router.post("/", jsonParser.json(), verifyToken, sendOtp);
}
