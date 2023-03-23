const Joi = require("joi");

const patientLoginValidator = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(2).required().email().messages({
      "string.empty": "Email cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Email is a required field.",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Password is a required field.",
    }),
  });
  return schema.validate(data);
};

const patientRegisterValidator = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().min(2).trim().required().messages({
      "string.empty": "First Name cannot be empty",
      "string.base": "This input should be a type of string.",
      "any.required": "First Name is a required field.",
    }),

    last_name: Joi.string().min(2).trim().required().messages({
      "string.empty": "Last Name cannot be empty",
      "string.base": "This input should be a type of string.",
      "any.required": "Last Name is a required field.",
    }),

    contact: Joi.string().min(11).trim().max(11).required().messages({
      "string.empty": "Contact cannot be empty",
      "string.base": "This input should be a type of string.",
      "any.required": "Contact is a required field.",
      "string.min": "Contact should have 11 numbers.",
      "string.max": "Contact should have 11 numbers.",
    }),

    email: Joi.string().min(2).required().email().messages({
      "string.empty": "Email cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Email is a required field.",
    }),
    password: Joi.string().min(5).required().messages({
      "string.empty": "Password cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Password is a required field.",
    }),
    confirm_pass: Joi.string().min(5).required().messages({
      "string.empty": "Confirm Password cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Confirm Password is a required field.",
    }),
  });
  return schema.validate(data);
};

module.exports = { patientLoginValidator, patientRegisterValidator };
