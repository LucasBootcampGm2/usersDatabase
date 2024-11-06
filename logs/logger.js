import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import { customLevels } from "./levels.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

winston.addColors(customLevels.colors);

const newTransport = (filePath, level) => {
  return new winston.transports.File({
    filename: path.resolve(__dirname, filePath),
    level: level,
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
      })
    ),
  });
};

const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} [${level}]: ${stack || message}`;
        })
      ),
    }),
    newTransport("./error.log", "error"),
    newTransport("./warnings.log", "warn"),
    newTransport("./combined.log", "info"),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.resolve(__dirname, "./exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.resolve(__dirname, "./rejections.log"),
    }),
  ],
  exitOnError: false,
});

logger.fatal = (message) => logger.log("fatal", message);
logger.trace = (message) => logger.log("trace", message);

export default logger;
