import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function verifyTokenMiddleWare(req, res, next) {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token required" });
  }

  try {
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    token = token.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ FIXED HERE
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}