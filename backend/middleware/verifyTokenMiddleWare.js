import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const jwtKey = process.env.JWT_SECRET;

export function verifyTokenMiddleWare(req, res, next) {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token required" });
  }

  try {
    // ✅ safer split check
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    token = token.split(" ")[1];

    const decoded = jwt.verify(token, jwtKey);

    // ✅ attach full user safely
    req.user = decoded.user;

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}