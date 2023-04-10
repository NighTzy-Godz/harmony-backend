const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

mongoose
  .connect(process.env.db_url)
  .then(() => console.log("Connected to the database - Admin"))
  .catch((e) => console.log(e, "Admin"));

const adminSchema = new mongoose.Schema({
  profile_pic: {
    type: String,
    default:
      "https://res.cloudinary.com/doggodoggo228/image/upload/v1681091805/z5y8gnfzvcmfzdb8a2xc.png",
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
  },

  password: {
    type: String,
    required: true,
  },

  listOfAppointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],

  listOfPatients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
  ],

  listOfDoctors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
  ],
});

adminSchema.methods.generateAuthToken = function (user) {
  const payload = {
    _id: user._id,
    full_name: user.full_name,
    role: user.role,
  };

  return jwt.sign(payload, process.env.jwtSecretPass);
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
