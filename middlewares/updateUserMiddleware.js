import logger from "../logs/logger.js";
import { checkEmailExistence } from "./existUserMiddleware.js";

const updateUser = async (req, res, next) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;

  if (await checkEmailExistence(email, res)) return;

  try {
    const result = await db.run(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, id]
    );
    if (result.changes > 0) {
      logger.info(`User updated successfully: ID ${id}`);
      res.status(200).json({ id, name, email });
    } else {
      logger.warn(`User not found for update: ID ${id}`);
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    next(err)
  }
};

export { updateUser };
