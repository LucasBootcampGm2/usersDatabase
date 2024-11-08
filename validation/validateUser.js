import { body } from "express-validator";

const validateUser = [
  body("name")
    .isString()
    .isLength({ min: 2 })
    .withMessage("Name is required and should be at least 2 characters.")
    .notEmpty()
    .withMessage("Name cannot be empty.")
    .trim()
    .escape()
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name should only contain letters and spaces."),

  body("email")
    .isEmail()
    .withMessage("Invalid email address.")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters.")
    .notEmpty()
    .withMessage("Password cannot be empty.")
    .trim()
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/)
    .withMessage(
      "Password must include uppercase, lowercase letters, and a number."
    ),

  body("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("Role must be either 'admin' or 'user'")
    .notEmpty()
    .withMessage("Role cannot be empty.")
    .trim()
    .escape(),
];

export { validateUser };
