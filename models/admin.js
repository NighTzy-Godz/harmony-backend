const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dbUrl = process.env.dbUrl || "mongodb://localhost:27017/harmony";

mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to the server. Admin"))
  .catch((e) => console.log("Error in the database. ADMIN", e));

const adminSchema = new mongoose.Schema({
  full_name: {
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
  isAdmin: {
    type: Boolean,
    default: true,
  },
  revenue: {
    type: Number,
  },

  pendingDoctors: [
    {
      type: new mongoose.Schema({
        full_name: {
          type: String,
        },
        contact: {
          type: String,
        },
        email: {
          type: String,
        },
      }),
    },
  ],

  listOfDoctors: [
    {
      type: new mongoose.Schema({
        full_name: {
          type: String,
        },
        specialty: {
          type: String,
        },
        gender: {
          type: String,
        },
        profile_picture: {
          type: String,
        },
      }),
    },
  ],
  listOfPatient: [
    {
      type: new mongoose.Schema({
        full_name: {
          type: String,
        },
        customId: {
          type: String,
        },
        gender: {
          type: String,
        },
        profile_picture: {
          type: String,
        },
      }),
    },
  ],
  listOfAppointments: [
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
        patient: {
          type: new mongoose.Schema({
            name: {
              type: String,
            },
            profile_picture: {
              type: String,
            },

            gender: {
              type: String,
            },
          }),
        },
        bookingDate: {
          type: String,
        },
        modeOfConsultation: {
          type: String,
        },
      }),
    },
  ],
});

adminSchema.methods.generateAuthToken = function () {
  const jwtPrivateKey = process.env.jwtPrivateKey;

  const token = jwt.sign(
    {
      _id: this._id,
      isAdmin: this.isAdmin,
    },
    jwtPrivateKey
  );

  return token;
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
