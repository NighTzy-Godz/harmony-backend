const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const secretPass = process.env.jwtSecretPass;
const dbUrl = process.env.db_url;
const { Appointment } = require("./Appointment");

mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to the database - Patient"))
  .catch((e) => console.log("Error on Pateint: ", e));

const patient_schema = new mongoose.Schema({
  profile_pic: {
    type: String,
    default:
      "https://www.kindpng.com/picc/m/451-4517876_default-profile-hd-png-download.png",
  },

  first_name: {
    type: String,
    required: true,
  },

  last_name: {
    type: String,
    required: true,
  },

  full_name: {
    type: String,
  },

  contact: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    default: "Patient",
  },

  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }],

  password: {
    type: String,
    required: true,
  },
});

patient_schema.post("findOneAndDelete", async function (patient) {
  try {
    if (patient) {
      const deletedAppt = await Appointment.deleteMany({
        _id: { $in: patient.appointments },
        status: "Pending",
      });
    }
  } catch (error) {
    console.log("Error in Deleting ", err);
  }
});

patient_schema.methods.generateAuthToken = function () {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  const token = jwt.sign(
    {
      _id: this._id,
      role: "Patient",
      name: this.first_name,
      exp: parseInt(exp.getTime() / 1000),
    },
    secretPass
  );

  return token;
};

const Patient = mongoose.model("Patient", patient_schema);

module.exports = Patient;
