import db from "../database/sqlite.js";
import logger from "../logs/logger.js";

const createUserService = (name, email, hashedPassword, role) => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "user"],
      function (err) {
        if (err) {
          logger.error(`Error creating user: ${err.message}`);
          return reject(err);
        }
        const userId = this.lastID;
        resolve({ id: userId, name, email });
      }
    );
  });
};

export { createUserService };
