import logger from "../logs/logger.js";
import { getUserByIdService } from "../services/getUserByIdService.js";

const getUser = async (req, res, next) => {
  const id = parseInt(req.params.id);

  try {
    const user = await getUserByIdService(id); 
    logger.info(`User retrieved successfully: ID ${id}`);
    res.status(200).json(user); 
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ message: "User not found" });
    }
    next(err); 
  }
};

export { getUser };
