const mongoose = require("mongoose");
const dbUrl = process.env.db_url;

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

  prescription: {
    type: String,
  },

  status: {
    type: String,
  },
});

const Appointment = mongoose.model("Appointment", appointment_schema);

modules.export = Appointment;
