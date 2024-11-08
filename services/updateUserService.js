import db from "../database/sqlite.js";
import logger from "../logs/logger.js";

const updateUserService = (id, name, email) => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, id],
      function (err) {
        if (err) {
          logger.error(`Error updating user: ${err.message}`);
          return reject(err);
        }
        if (this.changes > 0) {
          resolve({ id, name, email });
        } else {
          resolve(null);
        }
      }
    );
  });
};

export { updateUserService };
