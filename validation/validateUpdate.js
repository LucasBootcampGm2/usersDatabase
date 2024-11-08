import { body } from "express-validator";

const validateUpdate = [
  body("name")
    .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage("Name should be at least 2 characters.")
    .notEmpty()
    .withMessage("Name cannot be empty.")
    .trim()
    .escape()
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage(
      "New password must include uppercase, lowercase letters, and a number."
    )
    .withMessage("Name should only contain letters and spaces."),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address.")
    .normalizeEmail(),
];

export { validateUpdate };
