import express from "express";

import {
  validateLogin,
  validateUpdate,
  validatePasswordChange,
  validateUser,
} from "../validation/expressValidation.js";

import {
  authorize,
  authenticate,
  authId,
} from "../middlewares/authMiddlewares.js";
import { serverErrorHandler } from "../errorHandlers/serverErrorHandler.js";
import { validationErrorHandler } from "../errorHandlers/validationErrorHandler.js";
import { getAllUsersService } from "../services/getAllUsersService.js";
import { getUser } from "../controllers/getUserController.js";
import { registerUser } from "../controllers/registerUserController.js";
import { updateUser } from "../controllers/updateUserController.js";
import { changePassword } from "../controllers/changePasswordController.js";
import { deleteUser } from "../controllers/deleteUserController.js";
import { loginUser } from "../controllers/loginUserController.js";

const router = express.Router();

router.get("/", authenticate, authorize("admin"), getAllUsersService);

router.get("/:id", authenticate, authId, getUser);

router.post("/", validateUser, validationErrorHandler, registerUser);

router.patch(
  "/:id",
  authenticate,
  validateUpdate,
  validationErrorHandler,
  authId,
  updateUser
);

router.put(
  "/:id",
  authenticate,
  validateUpdate,
  validationErrorHandler,
  authId,
  updateUser
);

router.put(
  "/:id/change-password",
  authenticate,
  validatePasswordChange,
  validationErrorHandler,
  authId,
  changePassword
);

router.delete("/:id", authenticate, authId, deleteUser);

router.post("/login", validateLogin, validationErrorHandler, loginUser);

router.use(serverErrorHandler);

export default router;
