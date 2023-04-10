require("dotenv").config();
const mongoose = require("mongoose");
// const { renderCustomId } = require("../helpers/customId");
const dbUrl = process.env.db_url;
const emails = require("../helpers/email");
const names = require("../helpers/firstName");
const genders = require("../helpers/gender");
const specialties = require("../helpers/specialties");
const Doctor = require("../models/Doctor");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");

mongoose
  .connect(dbUrl)
  .then(() => console.log("Seeds Doctor - Connected"))
  .catch((e) => console.log("Error Seeds - Doctor ", e));

function randomData(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomContact() {
  return Math.floor(Math.random() * 9000000000) + 10000000000;
}

function randomEmail() {
  const email = emails[Math.floor(Math.random() * emails.length)].split(".");
  const newEmail = `${email[0]}@${email[1]}.com`;
  return newEmail;
}

async function run() {
  let admin = await Admin.findOne({ email: process.env.admin_email });
  if (!admin) return;

  for (let i = 0; i < 50; i++) {
    let doctor = new Doctor({
      first_name: randomData(names),
      last_name: randomData(names),
      contact: randomContact(),
      specialty: randomData(specialties),
      gender: randomData(genders),
      email: randomEmail(),
      role: "Doctor",
    });
    const salt = await bcrypt.genSalt(10);
    doctor.password = await bcrypt.hash("test123", salt);
    doctor.full_name = doctor.first_name + " " + doctor.last_name;
    admin.listOfDoctors.push(doctor);
    await doctor.save();
    await admin.save();
  }
}

run();
