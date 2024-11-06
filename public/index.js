import express from "express";
import userRouter from "../routes/users.js";
import dotenv from "dotenv";
import { loggerInfo } from "../middlewares/loggerMiddleware.js";
import {
  serverErrorHandler,
  notFoundHandler,
} from "../errorHandlers/serverErrorHandler.js";

dotenv.config();
const port = process.env.PORT;

const app = express();

app.use(express.json());

app.use("/users", userRouter);

app.use(serverErrorHandler);

app.use(loggerInfo);

app.use(notFoundHandler);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
