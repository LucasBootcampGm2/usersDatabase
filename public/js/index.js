import express from "express";
import {
  logger,
  handleError,
} from "../../middlewares/middlewares.js";
import userRouter from "../../routes/users.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(logger);

app.use("/users", userRouter);

app.use(handleError);

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
