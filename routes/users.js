import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {
  authenticate,
  authorize,
  handleError,
  logger,
  validateUser,
} from "../middlewares/middlewares.js";
import db from "../database/sqlite.js";

const router = express.Router();
router.use(handleError, logger);

dotenv.config(); 
const secretKey = process.env.SECRET_KEY;

router.get("/", authenticate, authorize("admin"), (req, res, next) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return next(err);
    res.json({ rows });
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
    return res.status(401).json({
      message: "Invalid Password",
    });
  }

  if (userId !== req.user.id) {
    return res.status(403).json({
      id: userId,
      message: "Permission denied",
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

        if (!isMatch || oldPassword === newPassword) {
          return res.status(401).json({ message: "Invalid Password" });
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

router.delete("/:id", authenticate, (req, res, next) => {
  const id = parseInt(req.params.id);
  db.run("DELETE FROM users WHERE id = ?", id, function (err) {
    if (err) return next(err);
    this.changes > 0
      ? res.status(200).json({ message: `User ${id} deleted` })
      : res.status(404).json({ message: "User not found" });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (!user) return res.status(404).json({ message: "User not found" });

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secretKey);
    res.json({ id: user.id, token });
  });
});

export default router;
