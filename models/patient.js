const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { appointmentSchema } = require("./appointment");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/harmony";

mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to the database patient"))
  .catch((e) => console.log("Cannot Connect to the database patient", e));

const patientSchema = new mongoose.Schema({
  profile_picture: {
    type: String,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  full_name: {
    type: String,
    default: this.first_name + " " + this.last_name,
  },

  appointmentHistory: [
    {
      type: new mongoose.Schema({
        doctor: {
          type: new mongoose.Schema({
            name: {
              type: String,
            },
            specialty: {
              type: String,
            },
          }),
        },
        amount: {
          type: Number,
        },
        contact: {
          type: String,
        },
        time: {
          type: String,
        },
        date: {
          type: String,
        },
        status: {
          type: String,
        },
      }),
    },
  ],
  appointments: [appointmentSchema],
});

patientSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      isPatient: true,
      name: this.first_name,
    },
    process.env.jwtPrivateKey
  );

  return token;
};

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
