import { changePasswordService } from "../services/changePasswordService.js";
import { existUserById } from "../middlewares/existUserMiddleware.js";

import bcrypt from "bcrypt";
import logger from "../logs/logger.js";

const changePassword = async (req, res, next) => {
  const id = parseInt(req.params.id);
  const { oldPassword, newPassword } = req.body;

  if (id !== req.user.id) {
    logger.warn(`Permission denied for user ID ${id}`);
    return res.status(403).json({ message: "Permission denied" });
  }

  try {
    const existingUser = await existUserById(id);

    if (!existingUser) {
      logger.warn(`User not found for password change: ID ${id}`);
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, existingUser.password);
    if (!isMatch) {
      logger.warn(`Invalid old password attempt for user ID ${id}`);
      return res.status(401).json({ message: "Invalid old password" });
    }

    const isSamePassword = await bcrypt.compare(oldPassword, newPassword);
    if (isSamePassword) {
      logger.warn(
        `New password cannot be the same as old password for user ID ${id}`
      );
      return res
        .status(400)
        .json({ message: "New password cannot be the same as old password" });
    }

    const isUpdated = await changePasswordService(id, newPassword);

    if (isUpdated) {
      logger.info(`Password updated successfully for user ID ${id}`);
      return res.status(200).json({ message: "Password updated successfully" });
    } else {
      logger.warn(`Failed to update password for user ID ${id}`);
      return res.status(500).json({ message: "Failed to update password" });
    }
  } catch (err) {
    next(err);
  }
};

export { changePassword };
