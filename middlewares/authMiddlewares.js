import jwt from "jsonwebtoken";
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
    return res.status(403).json({ message: "Invalid Token" });
  }
};

const authorize = (role) => (req, res, next) => {
  if (req.user.role !== role)
    return res.status(403).json({ message: "Access denied" });

  next();
};

export { authenticate, authorize };
