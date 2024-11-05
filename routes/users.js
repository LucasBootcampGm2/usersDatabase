import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {
  authenticate,
  authorize,
  requestInfo,
} from "../middlewares/middlewares.js";
import db from "../database/sqlite.js";
import {
  validateLogin,
  validateParcialUpdate,
  validatePasswordChange,
  validateUser,
} from "../validation/expressValidation.js";
import { serverHandleErrors } from "../errorHandlers/server.js";
import { validationHandlerErrors } from "../errorHandlers/validation.js";
import logger from "../logs/logger.js";

const router = express.Router();
router.use(serverHandleErrors, requestInfo);

dotenv.config();
const secretKey = process.env.SECRET_KEY;

router.get("/", authenticate, authorize("admin"), (req, res, next) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      logger.error("Error getting all users: ", err.message);
      return next(err);
    }
    logger.info("Users retrieved successfully");
    res.json({ rows });
  });
});

router.get("/:id", authenticate, (req, res, next) => {
  const id = parseInt(req.params.id);
  if (id !== req.user.id) {
    logger.warn("Access denied for user ID:", id);
    return res.status(403).json({ message: "Access denied" });
  }
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (err) return next(err);
    if (!row) {
      logger.warn("User not found: ", id);
      return res.status(404).json({ message: "User not found" });
    }
    logger.info("User retrieved successfully: ", row);
    res.status(200).json(row);
  });
});

router.post("/", validateUser, (req, res, next) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, role || "user"],
    function (err) {
      if (err) {
        logger.error("Error creating user: ", err.message);
        return next(err);
      }
      logger.info("User created successfully: ", {
        id: this.lastID,
        name,
        email,
      });
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
      logger.warn("Access denied for user ID:", id);
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
      logger.warn("Email already in use for: ", email);
      return res.status(409).json({ message: "Email already in use" });
    }

    db.run(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, id],
      function (err) {
        if (err) return next(err);
        if (this.changes > 0) {
          logger.info("User updated successfully: ", { id, name, email });
          res.status(200).json({ id, name, email });
        } else {
          logger.warn("User not found for update: ", id);
          res.status(404).json({ message: "User not found" });
        }
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
      logger.warn("Access denied for user ID:", id);
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
      logger.warn("Email already in use for: ", email);
      return res.status(409).json({ message: "Email already in use" });
    }

    db.run(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, id],
      function (err) {
        if (err) return next(err);
        if (this.changes > 0) {
          logger.info("User updated successfully: ", { id, name, email });
          res.status(200).json({ id, name, email });
        } else {
          logger.warn("User not found for update: ", id);
          res.status(404).json({ message: "User not found" });
        }
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
      logger.warn("Permission denied for user ID:", id);
      return res.status(403).json({ message: "Permission denied" });
    }

    const row = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!row) {
      logger.warn("User not found for password change: ", id);
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(oldPassword, row.password);
    if (!isMatch) {
      logger.warn("Invalid old password attempt for user ID:", id);
      return res.status(401).json({ message: "Invalid old password" });
    }

    const isSamePassword = await bcrypt.compare(oldPassword, newPassword);
    if (isSamePassword) {
      logger.warn(
        "New password cannot be the same as old password for user ID:",
        id
      );
      return res.status(401).json({ message: "Invalid new password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.run(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id],
      function (err) {
        if (err) return next(err);
        logger.info("Password updated successfully for user ID:", id);
        res.status(200).json({ message: "Password updated successfully." });
      }
    );
  }
);

router.delete("/:id", authenticate, (req, res, next) => {
  const id = parseInt(req.params.id);
  if (req.user.id !== id) {
    logger.warn("User attempted to delete another user ID:", id);
    return res
      .status(403)
      .json({ message: "You do not have permission to delete this user" });
  }

  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) return next(err);
    if (this.changes > 0) {
      logger.info("User deleted successfully:", id);
      res.status(200).json({ message: `User ${id} deleted` });
    } else {
      logger.warn("User not found for deletion: ", id);
      res.status(404).json({ message: "User not found" });
    }
  });
});

router.post("/login", validateLogin, async (req, res, next) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      logger.error("Error during login attempt: ", err.message);
      return next(err);
    }
    if (!user) {
      logger.warn("User not found during login attempt: ", email);
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      logger.warn("Invalid credentials for user email:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secretKey);
    logger.info("User logged in successfully: ", { id: user.id, email });
    res.json({ id: user.id, token });
  });
});

export default router;
