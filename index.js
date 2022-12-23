require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const patientRoute = require("./router/patient");
const doctorRoute = require("./router/doctor");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/patient", patientRoute);
app.use("/doctor", doctorRoute);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

const PORT = process.env.PORT || "8080";
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
