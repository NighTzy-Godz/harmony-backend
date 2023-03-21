const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const Doctor = require("../models/Doctor");
router.post("/register", async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      contact,
      email,
      specialty,
      password,
      confirm_pass,
    } = req.body;

    let doctor = await Doctor.findOne({ email });
    if (doctor)
      return res
        .status(409)
        .send("A User with this email is already registered.");

    if (confirm_pass !== password)
      return res
        .status(400)
        .send("Confirm Password and Password did not match.");

    doctor = new Doctor({
      first_name,
      last_name,
      contact,
      email,
      specialty,
    });

    const salt = await bcrypt.genSalt(10);
    doctor.password = await bcrypt.hash(password, salt);

    await doctor.save();

    res.send(doctor);
  } catch (ex) {
    next(ex);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let doctor = await Doctor.findOne({ email }).select("password");
    if (!doctor) return res.status(404).send("Doctor Did not found.");

    const validPassword = await bcrypt.compare(password, doctor.password);
    if (!validPassword)
      return res.status(400).send("Credentials did not match.");

    const token = doctor.generateAuthToken();
    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(doctor);
  } catch (ex) {
    next(ex);
  }
});

module.exports = router;
