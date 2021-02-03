import { Request, Response } from "express";
import jsonParser from "body-parser";
import createLogger from "../../../logger/mybunyan";
import crypto from "crypto";
const logger = createLogger("auth");
import client from "twilio";

let clientTwilio = client(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);
interface RequestI extends Request {
  session: any;
  message: any;
}
const sendOtp = (req: RequestI, res: Response) => {
  logger.info(req.session, "getUser: Request received!");
  const phone = req.body.phone;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const ttl = 15 * 60 * 1000;
  const expires = Date.now() + ttl;
  const data = `${phone}.${otp}.${expires}`;
  const hash = crypto
    .createHash("md5")
    .update(data)
    .digest("hex");
  const fullHash = `${hash}.${expires}`;

  //   clientTwilio.messages
  //     .create({
  //       body: `Hey, OTP for you DARBAR ACCESS ${otp}`,
  //       to: phone,
  //       from: "+15104013194"
  //     })
  //     .then((result: any) => {
  //       res.status(200).send({
  //         phone,
  //         hash: fullHash
  //       });
  //     })
  //     .catch((err: any) => {
  //       res.status(422).send(err);
  //     });

  res.send({
    phone,
    otp,
    hash: fullHash
  });
};
export default function(router: any) {
  router.post("/", jsonParser.json(), sendOtp);
}
