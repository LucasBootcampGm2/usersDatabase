import { body } from "express-validator";

const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Invalid email address.")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password length is not sufficient.")
    .notEmpty()
    .withMessage("Password cannot be empty.")
    .trim(),
];

export { validateLogin };
