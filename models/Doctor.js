const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
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
});

doctor_schema.methods.generateAuthToken = function () {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  const token = jwt.sign(
    {
      _id: this._id,
      role: this.role,
      full_name: this.full_name,
      exp: parseInt(exp.getTime() / 1000),
    },
    secretPass
  );

  return token;
};
