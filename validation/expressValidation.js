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

const validatePasswordChange = [
  body("oldPassword")
    .exists()
    .withMessage("Old password is required.")
    .isLength({ min: 6 })
    .withMessage("Old password must be at least 6 characters long.")
    .notEmpty()
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/)
    .withMessage("Old password cannot be empty.")
    .trim(),

  body("newPassword")
    .exists()
    .withMessage("New password is required.")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long.")
    .notEmpty()
    .withMessage("New password cannot be empty.")
    .trim()
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/)
    .withMessage(
      "New password must include uppercase, lowercase letters, and a number."
    )
    .custom((newPassword, { req }) => {
      const oldPassword = req.body.oldPassword;
      if (newPassword === oldPassword) {
        throw new Error(
          "New password must be different from the old password."
        );
      }
      return true;
    }),
];

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

export {
  validateUser,
  validateUpdate,
  validatePasswordChange,
  validateLogin,
};
