import { validationResult } from "express-validator";
import logger from "../logs/logger.js";

const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation errors: ${JSON.stringify(errors.array(), null, 2)}`);
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export { validationErrorHandler };
