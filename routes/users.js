import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import logger from "../logs/logger.js";
import db from "../database/sqlite.js";

import {
  validateLogin,
  validateUpdate,
  validatePasswordChange,
  validateUser,
} from "../validation/expressValidation.js";

import {
  authorize,
  authenticate,
  authId,
} from "../middlewares/authMiddlewares.js";
import { serverErrorHandler } from "../errorHandlers/serverErrorHandler.js";
import { validationErrorHandler } from "../errorHandlers/validationErrorHandler.js";
import { checkEmailExistence } from "../middlewares/existUserMiddleware.js";
import { getUserById } from "../middlewares/getUserIdMiddleware.js";

import { updateUser } from "../middlewares/updateUserMiddleware.js";

const router = express.Router();
router.use(serverErrorHandler);

const secretKey = process.env.SECRET_KEY;

router.get("/", authenticate, authorize("admin"), (req, res, next) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      logger.error(`Error retrieving all users: ${err.message}`);
      return next(err);
    }
    logger.info("All users retrieved successfully");
    res.json({ rows });
  });
});

router.get("/:id", authenticate, authId, async (req, res, next) => {
  const id = parseInt(req.params.id);

  try {
    const user = await getUserById(id, res, next);
    logger.info(`User retrieved successfully: ID ${id}`);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  validateUser,
  validationErrorHandler,
  async (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (await checkEmailExistence(email, res)) return;

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "user"],
      function (err) {
        if (err) {
          logger.error(`Error creating user: ${err.message}`);
          return next(err);
        }
        const userId = this.lastID;
        logger.info(`User created successfully: ID ${userId}`);
        res.status(201).json({ id: userId, name, email });
      }
    );
  }
);

router.patch(
  "/:id",
  authenticate,
  validateUpdate,
  validationErrorHandler,
  authId,
  updateUser
);

router.put(
  "/:id",
  authenticate,
  validateUpdate,
  validationErrorHandler,
  authId,
  updateUser
);

router.put(
  "/:id/change-password",
  authenticate,
  validatePasswordChange,
  validationErrorHandler,
  authId,
  async (req, res, next) => {
    const id = parseInt(req.params.id);
    const { oldPassword, newPassword } = req.body;

    try {
      const user = await getUserById(id, res, next);

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        logger.warn(`Invalid old password attempt for user ID ${id}`);
        return res.status(401).json({ message: "Invalid old password" });
      }

      const isSamePassword = await bcrypt.compare(oldPassword, newPassword);
      if (isSamePassword) {
        logger.warn(
          `New password cannot be the same as old password for user ID ${id}`
        );
        return res.status(401).json({ message: "Invalid new password" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.run(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, id],
        function (err) {
          if (err) return next(err);
          logger.info(`Password updated successfully for user ID ${id}`);
          res.status(200).json({ message: "Password updated successfully." });
        }
      );
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", authenticate, authId, async (req, res, next) => {
  const id = parseInt(req.params.id);

  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) return next(err);
    if (this.changes > 0) {
      logger.info(`User deleted successfully: ID ${id}`);
      res.status(200).json({ message: "User deleted" });
    } else {
      logger.warn(`User not found for deletion: ID ${id}`);
      res.status(404).json({ message: "User not found" });
    }
  });
});

router.post(
  "/login",
  validateLogin,
  validationErrorHandler,
  async (req, res, next) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
      if (err) {
        logger.error(`Error during login attempt: ${err.message}`);
        return next(err);
      }
      if (!user) {
        logger.warn(`User not found during login attempt: ${email}`);
        return res.status(404).json({ message: "User not found" });
      }

      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch) {
        logger.warn(`Invalid credentials for user email: ${email}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, secretKey);
      logger.info(
        `User logged in successfully: ID ${user.id}, email: ${email}`
      );
      res.json({ id: user.id, token });
    });
  }
);

export default router;
