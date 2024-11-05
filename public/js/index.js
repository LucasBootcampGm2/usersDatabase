import express from "express";
import userRouter from "../../routes/users.js";
import dotenv from "dotenv";
import morganMiddleWare from "../../logs/morgan.js";

dotenv.config();
const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use("/users", userRouter);
app.use(morganMiddleWare);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
