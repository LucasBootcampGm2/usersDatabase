import bcrypt from "bcrypt";
import db from "../database/sqlite.js";

const changePasswordService = (id, newPassword) => {
  return new Promise((resolve, reject) => {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.run(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id],
      function (err) {
        if (err) {
          logger.error(
            `Error updating password for user ID ${id}: ${err.message}`
          );
          return reject(err);
        }
        resolve(this.changes > 0);
      }
    );
  });
};

export { changePasswordService };
