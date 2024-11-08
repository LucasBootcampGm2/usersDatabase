import { createUserService } from "../services/createUserService.js";
import { existUserByEmail } from "../middlewares/existUserMiddleware.js";
import logger from "../logs/logger.js";
import bcrypt from "bcrypt";

const registerUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const existingUser = await existUserByEmail(email);

    if (existingUser) {
      logger.warn(`Email already in use: ${email}`);
      return res.status(409).json({ message: "Email already in use" });
    }

    const newUser = await createUserService(name, email, hashedPassword, role);

    logger.info(`User created successfully: ID ${newUser.id}`);
    res
      .status(201)
      .json({ id: newUser.id, name: newUser.name, email: newUser.email });
  } catch (err) {
    next(err);
  }
};

export { registerUser };
