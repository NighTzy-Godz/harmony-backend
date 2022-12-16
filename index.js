require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const patientRoute = require("./router/patient");
const doctorRoute = require("./router/doctor");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/patient", patientRoute);
app.use("/doctor", doctorRoute);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
