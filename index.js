require("dotenv").config();
const express = require("express");
const app = express();
const patient_route = require("./routes/patient");
const doctor_route = require("./routes/doctor");
const admin_route = require("./routes/admin");
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use("/admin", admin_route);
app.use("/patient", patient_route);

app.use("/doctor", doctor_route);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Method");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.listen(8080, () => {
  console.log("Listening on port 8080");
});
