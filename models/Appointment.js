const mongoose = require("mongoose");
const dbUrl = process.env.db_url;
const Patient = require("./Patient");
const Doctor = require("./Doctor");

mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to Database - Appointment"))
  .catch((e) => console.log("Error on Appointment ", e));

const appointment_schema = new mongoose.Schema({
  doctor: {
    type: new mongoose.Schema({
      full_name: String,
      profile_pic: String,
      specialty: String,
    }),
  },

  patient: {
    type: new mongoose.Schema({
      full_name: String,
      profile_pic: String,
    }),
  },

  amount: {
    type: String,
  },

  date: {
    type: String,
    required: true,
  },

  time: {
    type: String,
    required: true,
  },

  findings: {
    type: String,
    default: "None",
  },

  mode_of_consult: {
    type: String,
  },

  prescription: {
    type: String,
    default: "",
  },

  status: {
    type: String,
    default: "Pending",
  },
});

const Appointment = mongoose.model("Appointment", appointment_schema);

module.exports = { Appointment, appointment_schema };
