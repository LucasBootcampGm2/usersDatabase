import logger from "../logs/logger.js";

const loggerInfo = (req, res, next) => {
  logger.info(`Request method used: ${req.method}, URL used: ${req.url}`);
  next();
};

export { loggerInfo };
