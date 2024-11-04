import db from "../database/sqlite.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const secretKey = process.env.SECRET_KEY;

const logger = (req, res, next) => {
  console.log(`Request method used: ${req.method}, URL used: ${req.url}`);
  next();
};

const authenticate = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token not provided" });

  try {
    const payload = jwt.verify(token, secretKey);
    req.user = payload;

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid Token" });
  }
};

const authorize = (role) => (req, res, next) => {
  if (req.user.role !== role)
    return res.status(403).json({ message: "Access denied" });

  next();
};

const validateUser = (req, res, next) => {
  const { email } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) return next(err);

    if (row)
      return res
        .status(400)
        .json({ message: "User with this email already exists" });

    next();
  });
};

export { logger, authenticate, authorize, validateUser };
