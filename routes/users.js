import { express } from "express";
import {
  authenticate,
  authorize,
  handleError,
  logger,
} from "../middlewares/middlewares";
import db from "../database/sqlite";

const router = express.router();
router.use(handleError, logger);

router.get("/", authenticate, authorize("admin"), (req, res) => {
  db.get("SELECT * FROM users", [], (err, rows) => {
    if (err) return next(err);
    req.json({ rows });
  });
});

export default router;
