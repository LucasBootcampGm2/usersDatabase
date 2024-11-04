import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { authenticate, authorize, logger } from "../middlewares/middlewares.js";
import db from "../database/sqlite.js";
import {
  validateLogin,
  validateParcialUpdate,
  validatePasswordChange,
  validateUser,
} from "../validation/expressValidation.js";
import { serverHandleErrors } from "../errorHandlers/server.js";
import { validationHandlerErrors } from "../errorHandlers/validation.js";

const router = express.Router();
router.use(serverHandleErrors, logger);

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
  if (id !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
  }
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

router.patch(
  "/:id",
  authenticate,
  validateParcialUpdate,
  validationHandlerErrors,
  async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email } = req.body;

    const existingUser = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE email = ? AND id != ?",
        [email, id],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

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
  }
);

router.put(
  "/:id",
  authenticate,
  validateUser,
  validationHandlerErrors,
  async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email } = req.body;

    const existingUser = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE email = ? AND id != ?",
        [email, id],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

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
  }
);

router.put(
  "/:id/change-password",
  authenticate,
  validatePasswordChange,
  validationHandlerErrors,
  async (req, res, next) => {
    const id = parseInt(req.params.id);

    const { oldPassword, newPassword } = req.body;

    if (id !== req.user.id) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const row = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!row) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(oldPassword, row.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid old password" });

    const isSamePassword = await bcrypt.compare(oldPassword, newPassword);
    if (isSamePassword)
      return res.status(401).json({ message: "Invalid new password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.run(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id],
      function (err) {
        if (err) return next(err);
        res.status(200).json({ message: "Password updated successfully." });
      }
    );
  }
);

router.delete("/:id", authenticate, (req, res, next) => {
  const id = parseInt(req.params.id);
  if (req.user.id !== id) {
    return res
      .status(403)
      .json({ message: "You do not have permission to delete this user" });
  }

  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) return next(err);
    this.changes > 0
      ? res.status(200).json({ message: `User ${id} deleted` })
      : res.status(404).json({ message: "User not found" });
  });
});

router.post("/login", validateLogin, async (req, res, next) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(404).json({ message: "User not found" });

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, secretKey);
    res.json({ id: user.id, token });
  });
});

export default router;
