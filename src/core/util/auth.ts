import jwt from "jsonwebtoken";
export const verifyToken = async (req, res, next) => {
  const token = req.cookies.token || "";
  try {
    if (!token) {
      return res.status(401).json("You need to Login");
    }
    const decrypt = await jwt.verify(token, process.env.JWT_AUTH_TOKEN);
    debugger;
    req.user = {
      id: decrypt.id,
      firstname: decrypt.firstname
    };
    next();
  } catch (err) {
    return res.status(500).json(err.toString());
  }
};
