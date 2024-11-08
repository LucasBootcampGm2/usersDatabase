import db from "../database/sqlite.js";
import logger from "../logs/logger.js";

const existUser = async (email) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const checkEmailExistence = async (email, res) => {
  const existingUser = await existUser(email);
  if (existingUser) {
    logger.warn(`Email already in use: ${email}`);
    res.status(409).json({ message: "Email already in use" });
    return true;
  }
  return false;
};

export { checkEmailExistence };
