import logger from "../logs/logger.js";

const notFoundHandler = (req, res, next) => {
  logger.warn(
    `Rute not found: ${req.originalUrl}, Method: ${req.method}, IP: ${req.ip}`
  );
  res.status(404).json({ error: "Rute not found" });
};

export { notFoundHandler };
