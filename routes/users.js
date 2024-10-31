import express from "express";
import bcrypt from "bcrypt";
import {
  authenticate,
  authorize,
  handleError,
  logger,
  validateUser,
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

router.post("/", validateUser, (req, res, next) => {
  const { name, email, password, role } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, role || "user"],
    function (err) {
      if (err) return next(err);
      res.status(201).json({ id: this.lastID, name, email });
    }
  );
});

router.patch("/:id", authenticate, (req, res, next) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ message: "All fields are required" });

  db.run(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, id],
    function (err) {
      if (err) return next(err);
      this.changes > 0
        ? res.status(200).json({ id, name, email })
        : res.status(404).json({ message: "User not found" });
    }
  );
});

router.put("/:id", authenticate, (req, res, next) => {
  const id = req.params.id;
  const { name, email } = req.body;

  db.run(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, id],
    function (err) {
      if (err) return next(err);
      this.changes > 0
        ? res.status(200).json({ id, name, email })
        : res.status(404).json({ message: "User not found" });
    }
  );
});

router.put("/:id/change-password", authenticate, async (req, res, next) => {
    const userId = parseInt(req.params.id);
    const { oldPassword, newPassword } = req.body;
  
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Please provide both old and new passwords." });
    }
  
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "The new password must be at least 6 characters long.",
      });
    }
  
    if (userId !== req.user.id) {
      return res
        .status(403)
        .json({
          id: userId,
          message: "You do not have permission to change this user's password.",
        });
    }
  
    try {
      db.get(
        "SELECT password FROM users WHERE id = ?",
        [userId],
        async (err, row) => {
          if (err) return next(err);
  
          if (!row) {
            return res.status(404).json({ message: "User not found." });
          }
  
          const isMatch = await bcrypt.compare(oldPassword, row.password);
          if (!isMatch) {
            return res
              .status(400)
              .json({ message: "The old password is incorrect." });
          }
  
          if (oldPassword === newPassword) {
            return res.status(400).json({
              message: "The new password cannot be the same as the old password.",
            });
          }
  
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(newPassword, salt);
  
          db.run(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, userId],
            (updateErr) => {
              if (updateErr) return next(updateErr);
              res.status(200).json({ message: "Password updated successfully." });
            }
          );
        }
      );
    } catch (error) {
      next(error);
    }
  });
  

export default router;
