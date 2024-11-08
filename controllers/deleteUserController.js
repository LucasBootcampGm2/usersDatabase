import logger from "../logs/logger.js";
import { deleteUserService } from "../services/deleteUserService.js";

const deleteUser = async (req, res, next) => {
    const id = parseInt(req.params.id);
  
    if (id !== req.user.id) {
      logger.warn(`Permission denied for user ID ${id}`);
      return res.status(403).json({ message: "Permission denied" });
    }
  
    try {
      const result = await deleteUserService(id);
  
      if (result > 0) {
        logger.info(`User deleted successfully: ID ${id}`);
        return res.status(200).json({ message: "User deleted" });
      } else {
        logger.warn(`User not found for deletion: ID ${id}`);
        return res.status(404).json({ message: "User not found" });
      }
    } catch (err) {
      next(err); 
      
    }
  };
  
  export {deleteUser}