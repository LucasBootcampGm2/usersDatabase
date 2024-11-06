import morgan from "morgan";
import logger from "../logs/logger.js";

const morganMiddleWare = morgan("tiny", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

export default morganMiddleWare;
