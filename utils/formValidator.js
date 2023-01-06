const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
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
    pass1: Joi.string().min(5).required().messages({
      "string.empty": "Password cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Password is a required field.",
    }),
    pass2: Joi.string().min(5).required().messages({
      "string.empty": "Confirm Password cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Confirm Password is a required field.",
    }),
  });
  return schema.validate(data);
};

const patientUpdateValidator = (data) => {
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
  });
  return schema.validate(data);
};

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

const doctorRegisterValidator = (data) => {
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

    specialty: Joi.string().required().messages({
      "string.empty": "Specialty cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Specialty input is a required field.",
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

    pass1: Joi.string().min(5).required().messages({
      "string.empty": "Password cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Password is a required field.",
    }),

    pass2: Joi.string().min(5).required().messages({
      "string.empty": "Confirm Password cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Confirm Password is a required field.",
    }),
  });
  return schema.validate(data);
};

const patientChangePassValidator = (data) => {
  const schema = Joi.object({
    currPass: Joi.string().required().messages({
      "string.empty": "Current Password cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Current Password is a required field.",
    }),
    newPass: Joi.string().required().messages({
      "string.empty": "New Password cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "New Password is a required field.",
    }),

    confirmPass: Joi.string().required().messages({
      "string.empty": "Confirm Password cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Confirm Password is a required field.",
    }),
  });
  return schema.validate(data);
};

const doctorLoginValidator = (data) => {
  const schema = Joi.object({
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
  });
  return schema.validate(data);
};

const appointmentValidator = (data) => {
  const schema = Joi.object({
    doctorId: Joi.objectId().required(),
    time: Joi.string().required().messages({
      "string.empty": "Time cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Time is a required field.",
    }),

    date: Joi.string().required().messages({
      "string.empty": "Date cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Date is a required field.",
    }),
  });
  return schema.validate(data);
};

const decideAppointmentValidator = (data) => {
  const schema = Joi.object({
    patientId: Joi.objectId().required(),
    apptId: Joi.objectId().required(),
    status: Joi.string().required(),
  });

  return schema.validate(data);
};

module.exports = {
  patientRegisterValidator,
  patientLoginValidator,
  patientUpdateValidator,
  patientChangePassValidator,
  doctorRegisterValidator,
  doctorLoginValidator,
  appointmentValidator,
  decideAppointmentValidator,
};
