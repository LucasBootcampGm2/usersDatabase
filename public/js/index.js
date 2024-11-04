import express from "express";
import userRouter from "../../routes/users.js";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use("/users", userRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
