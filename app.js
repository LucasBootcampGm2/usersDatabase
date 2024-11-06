import "dotenv/config";
const port = process.env.PORT;

import express from "express";
import userRouter from "./routes/users.js";
import { loggerInfo } from "./middlewares/loggerMiddleware.js";
import {
  serverErrorHandler,
  notFoundHandler,
} from "./errorHandlers/serverErrorHandler.js";

const app = express();

app.use(express.json());

app.use("/users", userRouter);

app.use(serverErrorHandler);

app.use(loggerInfo);

app.use(notFoundHandler);


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
