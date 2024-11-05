import winston from "winston";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const filePath = path.join(__dirname, "users.log");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: filePath }),
  ],
});

export default logger;
