import db from "../database/sqlite.js";
import logger from "../logs/logger.js";

const getUserByIdService = (id) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
      if (err) {
        logger.error(`Database error: ${err.message}`);
        return reject(err);
      }
      if (!row) {
        logger.warn(`User not found: ID ${id}`);
        return reject(new Error("User not found"));
      }
      resolve(row);
    });
  });
};

export { getUserByIdService };
