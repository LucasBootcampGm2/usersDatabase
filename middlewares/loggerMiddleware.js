import dotenv from "dotenv";
import logger from "../logs/logger.js";

dotenv.config();

const loggerInfo = (req, res, next) => {
  logger.info(`Request method used: ${req.method}, URL used: ${req.url}`);
  next();
};

export { loggerInfo };
