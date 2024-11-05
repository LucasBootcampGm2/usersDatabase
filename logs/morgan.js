import morgan from "morgan";
import logger from "./logger.js";

const morganMiddleWare = morgan("tiny", {
  stream: {
    write: (message) => logger.info(message.trim()), 
  },
});

export default morganMiddleWare;
