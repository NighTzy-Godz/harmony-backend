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
  let admin = new Admin({
    first_name: "Harmony",
    last_name: "Admin",
    contact: randomContact(),
    email: "harmonyadmin@gmail.com",
    role: "Admin",
  });

  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash("test123", salt);
  admin.full_name = admin.first_name + " " + admin.last_name;

  await admin.save();
}

run();
