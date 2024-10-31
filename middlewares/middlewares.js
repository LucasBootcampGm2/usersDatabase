import jwt from "jsonwebtoken";
const secretKey = "secret";

const handleError = (err, req, res, next) => {
  const statusCode =
    err.status || (err.code && err.code.startsWith("SQLITE") ? 500 : 400);

  const errorMessage = err.message || "Unknown error";

  console.error("Error stack:", err.stack);

  res.status(statusCode).json({ error: errorMessage });
};

const logger = (req, res, next) => {
  console.log(`Request method used: ${req.method}, URL used: ${req.url}`);
  next();
};

const authenticate = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token not provide" });

  try {
    const payload = jwt.verify(token, secretKey);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid Token" });
  }
};

export { handleError };
