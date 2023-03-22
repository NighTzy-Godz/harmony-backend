const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const { isAuth, isPatient } = require("../middleware/auth");
const Patient = require("../models/Patient");

// =========================================================================
// ================ GET THE DATA OF THE CURRENT PATIENT ====================
// =========================================================================

router.get("/me", [isAuth, isPatient], async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.user._id });
    if (!patient) return res.status(404).send("Patient did not found.");

    res.send(patient);
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// =========== AUTHENTICATION AND AUTHORIZATION OF THE PATIENT =============
// =========================================================================

router.post("/register", async (req, res, next) => {
  try {
    const { first_name, last_name, email, contact, confirm_pass, password } =
      req.body;

    let patient = await Patient.findOne({ email });
    if (patient)
      return res.status(409).send("This email is already registered.");

    if (confirm_pass !== password)
      return res
        .status(400)
        .send("Confirm Password and Password did not match.");

    patient = new Patient({
      first_name,
      last_name,
      email,
      contact,
      full_name: first_name + " " + last_name,
    });

    const salt = await bcrypt.genSalt(10);
    patient.password = await bcrypt.hash(password, salt);

    await patient.save();
    res.send(patient);
  } catch (ex) {
    next(ex);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let patient = await Patient.findOne({ email }).select("password");
    if (!patient) return res.status(404).send("User did not found.");

    const validPassword = await bcrypt.compare(password, patient.password);
    if (!validPassword) return res.status(401).send("Password did not match");

    const token = patient.generateAuthToken();

    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(patient);
  } catch (ex) {
    next(ex);
  }
});

module.exports = router;
