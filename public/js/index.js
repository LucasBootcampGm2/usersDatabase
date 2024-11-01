import express from "express";
import userRouter from "../../routes/users.js";
import { handleError, logger } from "../../middlewares/middlewares.js";

dotenv.config();
const port = process.env.PORT 

const app = express();

app.use(express.json());
app.use("/users", userRouter);
app.use(handleError, logger);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
