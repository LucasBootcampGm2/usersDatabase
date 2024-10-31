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

router.get("/:id", authenticate, (req, res, next) => {
    const id = parseInt(req.params.id);
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
      if (err) return next(err);
      row
        ? res.status(200).json(row)
        : res.status(404).json({ message: "User not found" });
    });
  });

export default router;
