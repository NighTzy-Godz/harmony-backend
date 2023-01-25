const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { appointmentSchema } = require("../models/appointment");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/harmony";
mongoose
  .connect(dbUrl)
  .then(() => console.log(`Connected to the database doctor ${dbUrl}`))
  .catch((e) =>
    console.log("There was a problem connecting to the database doctor", e)
  );

const doctorSchema = new mongoose.Schema({
  profile_picture: {
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

  specialty: {
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

  rate: {
    type: Number,
    default: 500,
  },

  password: {
    type: String,
    required: true,
  },

  isDoctor: {
    type: Boolean,
    default: true,
  },

  full_name: {
    type: String,
  },

  isConfirmed: {
    type: Boolean,
    default: false,
  },

  gender: {
    type: String,
    required: true,
  },
  numberOfAppointments: {
    type: Number,
    default: 0,
  },
  acceptedAppointments: [
    {
      type: new mongoose.Schema({
        patient: {
          type: new mongoose.Schema({
            name: {
              type: String,
            },
          }),
        },
        amount: {
          type: Number,
        },

        date: {
          type: String,
        },

        time: {
          type: String,
        },

        contact: {
          type: String,
        },
        status: {
          type: String,
        },
      }),
    },
  ],
  numberOfPatients: {
    type: Number,
  },

  requestAppointment: [appointmentSchema],
});

doctorSchema.methods.generateAuthToken = function () {
  const jwtPrivateKey = process.env.jwtPrivateKey;

  const token = jwt.sign(
    {
      _id: this._id,
      isDoctor: this.isDoctor,
      isConfirmed: this.isConfirmed,
    },
    jwtPrivateKey
  );
  return token;
};

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
