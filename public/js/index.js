import express from "express";

const app = express();

app.use(express.json());

const port = 3000;

app.listen(port, (err) => {
  if (err) {
    console.error(err);
  }
  console.log(`Server listening at http://localhost:${port}`);
});
