import Joi from "joi";

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("user", "admin").optional(),
});

const updatedSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
});
