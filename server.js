import  express  from "express";

const app = express();
app.use(express.json());

const port = 3000;
app.listen(port, () => {
  console.log(`Server running in http://localhost/${port} `);
});
