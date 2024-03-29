const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const userUpdatePassword = (data) => {
  const schema = Joi.object({
    currentPass: Joi.string().required().messages({
      "string.empty": "Password cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Password is a required field.",
    }),
    newPass: Joi.string().min(5).required().messages({
      "string.empty": "Password cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Password is a required field.",
    }),
    confirmPass: Joi.string().min(5).required().min(5).messages({
      "string.empty": "Password cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Password is a required field.",
    }),
  });

  return schema.validate(data);
};

const userUpdateAccountValidator = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().min(2).trim().messages({
      "string.empty": "First Name cannot be empty",
      "string.base": "This input should be a type of string.",
    }),

    last_name: Joi.string().min(2).trim().messages({
      "string.empty": "Last Name cannot be empty",
      "string.base": "This input should be a type of string.",
    }),

    contact: Joi.string().min(11).trim().max(11).messages({
      "string.empty": "Contact cannot be empty",
      "string.base": "This input should be a type of string.",
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

const userLoginValidator = (data) => {
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

const appointmentValidator = (data) => {
  const schema = Joi.object({
    doc_id: Joi.objectId().required(),
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

    mode_of_consult: Joi.string().required().messages({
      "string.empty": "Mode of Consultation cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Mode of Consultation is a required field.",
    }),
  });
  return schema.validate(data);
};
const documentIdValidator = (data) => {
  const schema = Joi.object({
    document_id: Joi.objectId().required(),
  });
  return schema.validate(data);
};

const prescriptionValidator = (data) => {
  const schema = Joi.object({
    prescription: Joi.string().min(5).required().messages({
      "string.empty": "Prescription cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Prescription is a required field.",
    }),
    findings: Joi.string().required().messages({
      "string.empty": "Findings cannot be empty.",
      "string.base": "This input should be a type of string.",
      "any.required": "Findings is a required field.",
    }),

    appt_id: Joi.objectId().required(),
  });
  return schema.validate(data);
};

const decideAppointmentValidator = (data) => {
  const schema = Joi.object({
    appt_id: Joi.objectId().required(),
    status: Joi.string().required(),
  });

  return schema.validate(data);
};

module.exports = {
  appointmentValidator,
  documentIdValidator,
  decideAppointmentValidator,
  userLoginValidator,
  patientRegisterValidator,
  prescriptionValidator,
  userUpdatePassword,
  userUpdateAccountValidator,
};
