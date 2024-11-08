import { body } from "express-validator";

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

export { validatePasswordChange };
