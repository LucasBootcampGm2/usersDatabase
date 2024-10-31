import db from "../database/sqlite.js";
import jwt from "jsonwebtoken";

const secretKey = "secret";

const handleError = (err, req, res, next) => {
  console.error("Error:", err.message || err);
  if (err.code === "SQLITE_CONSTRAINT") {
    return res
      .status(400)
      .json({ error: "Constraint violated: duplicate or invalid data." });
  } else if (err.code) {
    return res.status(500).json({ error: `Database error: ${err.message}` });
  } else {
    return res.status(500).json({ error: "Unknown server error" });
  }
};

const logger = (req, res, next) => {
  console.log(`Method: ${req.method} - URL: ${req.url}`);
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
    return res.status(403).json({ message: "Invalid token" });
  }
};

const authorize = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

const validateUser = (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email)
    return res.status(400).json({ message: "Missing user data" });

  db.get("SELECT email FROM users WHERE email = ?", [email], (err, row) => {
    if (err) return handleError(err, req, res);

    if (row)
      return res
        .status(400)
        .json({ message: "User with this email already exists" });

    next();
  });
};

export { handleError, logger, validateUser, authenticate, authorize };
