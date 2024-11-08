import jwt from "jsonwebtoken";
import logger from "../logs/logger.js";
const secretKey = process.env.SECRET_KEY;

const authenticate = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token not provided" });

  try {
    const payload = jwt.verify(token, secretKey);
    req.user = payload;

    next();
  } catch (error) {
    logger.warn(`Invalid Token`);
    return res.status(403).json({ message: "Invalid Token" });
  }
};

const authorize = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    logger.warn(`Access denied for user ID: ${id}`);
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

const authId = (req, res, next) => {
  if (id !== req.user.id) {
    logger.warn(`Access denied for user ID: ${id}`);
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

export { authenticate, authorize, authId };
