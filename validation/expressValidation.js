import { body, validationResult } from "express-validator";

const handleError = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };

const validateUser = [
  body("name")
    .isString()
    .isLength({ min: 2 })
    .withMessage("Name is required and should be at least 2 characters."),
  body("email").isEmail().withMessage("Invalid email address."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
  body("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("Role must be either 'admin' or 'user'."),
  handleError,
];

const validateParcialUpdate = [
  body("name")
    .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage("Name should be at least 2 characters."),
  body("email").optional().isEmail().withMessage("Invalid email address."),
  handleError,
];

const validatePasswordChange = [
  body("oldPassword")
    .exists()
    .withMessage("Old password is required")
    .isLength({ min: 6 })
    .withMessage("Old password must be at least 6 characters long")
    .notEmpty()
    .withMessage("Old password cannot be empty"),

  body("newPassword")
    .exists()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .notEmpty()
    .withMessage("New password cannot be empty")
    .custom((newPassword, { req }) => {
      const oldPassword = req.body.oldPassword;
      if (newPassword === oldPassword) {
        throw new Error("New password must be different from the old password");
      }
      return true;
    }),
  handleError,
];

const validateLogin = [
  body("email").isEmail().withMessage("Invalid email address."),
  body("password").exists().withMessage("Password is required."),
  handleError,
];

export {
  validateUser,
  validateParcialUpdate,
  validatePasswordChange,
  validateLogin,
};
