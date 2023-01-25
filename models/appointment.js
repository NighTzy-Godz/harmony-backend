const mongoose = require("mongoose");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/harmony";
mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to the database. Appointment"))
  .catch((e) => console.log(`There is a problem in Appointment ${dbUrl}`, e));

const appointmentSchema = new mongoose.Schema({
  ownedBy: {
    type: new mongoose.Schema({
      name: {
        type: String,
      },
      contact: {
        type: String,
      },

      gender: {
        type: String,
      },
    }),
    required: true,
  },

  status: {
    type: String,
    default: "Pending",
  },

  amount: {
    type: Number,
  },

  time: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },

  duration: {
    type: String,
    default: "Not Yet",
  },

  modeOfConsultation: {
    type: String,
  },

  bookingDate: {
    type: String,

    default: Date.now,
  },
  doctor: {
    type: new mongoose.Schema({
      name: {
        type: String,
      },

      specialty: {
        type: String,
      },
    }),

    required: true,
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = { Appointment, appointmentSchema };
