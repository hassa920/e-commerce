import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function verifyTokenMiddleWare(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader) {
      return res.status(403).json({ message: "Token required" });
    }

    if (typeof authHeader !== "string") {
      return res.status(401).json({ message: "Invalid token format" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    console.log("TOKEN ERROR:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}