import { loginUserService } from "../services/loginUserService.js";

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const { id, token } = await loginUserService(email, password);
    res.status(200).json({ id, token });
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ message: "User not found" });
    }
    if (err.message === "Invalid credentials") {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    next(err);
  }
};

export { loginUser };
