import logger from "../logs/logger.js";

const getUserById = (id, res, next) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
      if (err) reject(err);
      if (!row) {
        logger.warn(`User not found: ID ${id}`);
        return res.status(404).json({ message: "User not found" });
      }
      resolve(row);
    });
  });
};

export { getUserById };
