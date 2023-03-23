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

module.exports = { patientLoginValidator };
