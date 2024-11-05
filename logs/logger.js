import winston from "winston";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "logs/error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "logs/warnings.log"),
      level: "warn",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "logs/combined.log"),
      level: "info",
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, "logs/exceptions.log"),
      level: 'error'
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, "logs/rejections.log"),
    }),
  ],
});

logger.debug = (message) => logger.log("debug", message);
logger.info = (message) => logger.log("info", message);
logger.warn = (message) => logger.log("warn", message);
logger.error = (message) => logger.log("error", message);

export default logger;
