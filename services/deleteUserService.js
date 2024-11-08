import db from "../database/sqlite.js";
import logger from "../logs/logger.js";

const deleteUserService = (id) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
      if (err) {
        logger.error(`Error deleting user: ${err.message}`);
        return reject(err);
      }
      resolve(this.changes);
    });
  });
};

export { deleteUserService };
