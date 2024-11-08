import jwt from "jsonwebtoken";
import db from "../database/sqlite.js";
import logger from "../logs/logger.js";
import bcrypt from "bcrypt";

const secretKey = process.env.SECRET_KEY;

const loginUserService = async (email, password) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
      if (err) {
        logger.error(`Error during login attempt: ${err.message}`);
        return reject(err);
      }
      if (!user) {
        logger.warn(`User not found during login attempt: ${email}`);
        return reject({ message: "User not found" });
      }

      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch) {
        logger.warn(`Invalid credentials for user email: ${email}`);
        return reject({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, secretKey);
      logger.info(
        `User logged in successfully: ID ${user.id}, email: ${email}`
      );
      resolve({ id: user.id, token });
    });
  });
};

export { loginUserService };
