require("dotenv").config();

const mongoose = require("mongoose");
const Doctor = require("../models/doctor");
const names = require("../helpers/firstName");
const specialties = require("../helpers/specialties");
const email = require("../helpers/email");
const bcrypt = require("bcrypt");
const gender = require("../helpers/gender");
const firstName = require("../helpers/firstName");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/harmony";
console.log(dbUrl);
mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to the database for SEEDS"))
  .catch(() => console.log("There was a problem connecting to the database"));

function randomDetails(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber() {
  return Math.floor(Math.random() * 9000000000) + 10000000000;
}

function randomEmail(array) {
  const email = array[Math.floor(Math.random() * array.length)].split(".");
  const newEmail = `${email[0]}@${email[1]}.com`;
  return newEmail;
}

async function run() {
  const doctor = new Doctor({
    first_name: randomDetails(names),
    last_name: randomDetails(names),
    specialty: randomDetails(specialties),
    contact: randomNumber(),
    email: randomEmail(email),
    gender: randomDetails(gender),
    isConfirmed: true,
  });

  doctor.full_name = doctor.first_name + " " + doctor.last_name;
  const salt = await bcrypt.genSalt(10);
  doctor.password = await bcrypt.hash("12345", salt);
  await doctor.save();
  console.log(doctor);
}

for (let i = 0; i < 20; i++) {
  run();
}
