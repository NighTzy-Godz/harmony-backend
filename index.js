require("dotenv").config();
const express = require("express");
const app = express();
const patient_route = require("./routes/patient");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/patient", patient_route);

app.listen(8080, () => {
  console.log("Listening on port 8080");
});
