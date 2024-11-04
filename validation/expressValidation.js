import { body, validationResult } from "express-validator";

const validateUser = [
  body("name").isString().isLength({ min: 2 }).withMessage("Name is required and should be at least 2 characters."),
  body("email").isEmail().withMessage("Invalid email address."),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  body("role").optional().isIn(["admin", "user"]).withMessage("Role must be either 'admin' or 'user'."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

const validateParcialUpdate = [
  body("name").optional().isString().isLength({ min: 2 }).withMessage("Name should be at least 2 characters."),
  body("email").optional().isEmail().withMessage("Invalid email address."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

const validatePasswordChange = [
  body("oldPassword").exists().withMessage("Old password is required."),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

const validateLogin = [
  body("email").isEmail().withMessage("Invalid email address."),
  body("password").exists().withMessage("Password is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export {
  validateUser,
  validateParcialUpdate,
  validatePasswordChange,
  validateLogin,
};
