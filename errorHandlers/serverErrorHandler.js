import logger from "../logs/logger.js";

const serverErrorHandler = (err, req, res, next) => {
  if (err) {
    const errorMessage = err.message;
    const statusCode = err.statusCode || 500;
    const reqUrl = req.originalUrl;
    const reqMethod = req.method;
    const reqIP = req.ip;

    logger.error(
      ` Error: ${errorMessage} - Url: ${reqUrl} - Method: ${reqMethod} - IP: ${reqIP}`
    );

    return res
      .status(statusCode)
      .json({ error: "An unexpected error occurred." });
  }
  next();
};

const notFoundHandler = (req, res, next) => {
  logger.warn(
    `Route not found: ${req.originalUrl}, Method: ${req.method}, IP: ${req.ip}`
  );
  res.status(404).json({ error: "Route not found" });
};

export { notFoundHandler, serverErrorHandler};
