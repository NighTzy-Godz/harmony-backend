const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Appointment } = require("./Appointment");
const secretPass = process.env.jwtSecretPass;
const dbUrl = process.env.db_url;

mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to the databse - Doctor"))
  .catch((e) => console.log("Error on Doctor ", e));

const doctor_schema = new mongoose.Schema({
  profile_pic: {
    type: String,
    default:
      "https://ahaliagroup.com/ahm/wp-content/uploads/2020/05/default_dr.jpg",
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

  rate: {
    type: String,
    default: "500",
  },

  gender: {
    type: String,
    required: true,
  },

  contact: {
    type: String,
    required: true,
  },

  specialty: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    default: "Doctor",
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }],

  password: {
    type: String,
    required: true,
  },
});

doctor_schema.post("findOneAndDelete", async function (doc) {
  try {
    if (doc) {
      await Appointment.deleteMany({
        _id: { $in: doc.appointments },
        status: "Pending",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

doctor_schema.methods.generateAuthToken = function (user) {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  const payload = {
    _id: user._id,
    role: "Doctor",
    full_name: user.full_name,
    isConfirmed: user.isConfirmed,
  };

  const token = jwt.sign(payload, secretPass, {
    expiresIn: parseInt(exp.getTime() / 1000),
  });

  return token;
};

const Doctor = mongoose.model("Doctor", doctor_schema);

module.exports = Doctor;
