import db from "../database/sqlite.js";
import logger from "../logs/logger.js";

const getAllUsersService = (req, res, next) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      console.log("Error in DB query");
      logger.error(`Error retrieving all users: ${err.message}`);
      return next(err);
    }
    logger.info("All users retrieved successfully");
    res.status(200).json({ rows });
  });
};

export { getAllUsersService };
