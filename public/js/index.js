import express from "express";
import userRouter from "../../routes/users.js";
import dotenv from "dotenv";
import { loggerInfo } from "../../middlewares/middlewares.js";
import { serverHandleErrors } from "../../errorHandlers/server.js";
import { notFoundHandler } from "../../errorHandlers/notFound.js";

dotenv.config();
const port = process.env.PORT;

const app = express();

app.use(express.json());

app.use("/users", userRouter);

app.use(serverHandleErrors);

app.use(loggerInfo);

app.use(notFoundHandler);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
