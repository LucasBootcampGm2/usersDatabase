import { updateUserService } from "../services/updateUserService.js";
import logger from "../logs/logger.js";
import { existUserByEmail } from "../middlewares/existUserMiddleware.js";

const updateUser = async (req, res, next) => {
  const id = parseInt(req.params.id);
  
  if (id !== req.user.id) {
    logger.warn(`Access denied for user ID: ${id}`);
    return res.status(403).json({ message: "Access denied" });
  }

  const { name, email } = req.body;

  try {
    const existingUser = await existUserByEmail(email);

    if (existingUser) {
      logger.warn(`Email already in use: ${email}`);
      return res.status(409).json({ message: "Email already in use" });
    }

    const updatedUser = await updateUserService(id, name, email);

    if (updatedUser) {
      logger.info(`User updated successfully: ID ${id}`);
      res.status(200).json(updatedUser);
    } else {
      logger.warn(`User not found for update: ID ${id}`);
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    next(err); 
  }
};

export { updateUser };
