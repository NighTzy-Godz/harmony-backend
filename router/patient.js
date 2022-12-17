const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });

const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const { Appointment } = require("../models/appointment");

const register = require("../middleware/patientRegister");
const { auth, isPatient } = require("../middleware/auth");

const {
  patientRegisterValidator,
  patientLoginValidator,
  appointmentValidator,
} = require("../utils/formValidator");

// =========================================================================
// =============== GETTING THE INFORMATION OF THE USER =====================
// =========================================================================

router.get("/me", [auth, isPatient], async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.user._id });
    if (!patient) return res.status(400).send("User was not found");
    res.send(patient);
  } catch (e) {
    next(e);
  }
});

// =========================================================================
// ========================== SEARCHING A DOCTOR ===========================
// =========================================================================

router.get("/search_doctor/:search", async (req, res, next) => {
  try {
    const query = new RegExp(`.*${req.params.search}.*`, "i");

    const doctor = await Doctor.find({ full_name: query });
    res.send(doctor);
  } catch (ex) {
    next(ex);
  }
});

// =========================================================================
// ===================== CREATING AN APPOINTMENT ===========================
// =========================================================================

router.post("/appointment", auth, async (req, res, next) => {
  try {
    const { error } = appointmentValidator(req.body);
    if (error) {
      for (let item of error.details) {
        return res.status(400).send(item.message);
      }
    }

    const patient = await Patient.findOne({ _id: req.user._id }).select(
      "first_name last_name contact appointments"
    );

    if (!patient) return res.status(400).send("No Patient was found.");

    const doctor = await Doctor.findOne({ _id: req.body.doctorId });

    const appointment = new Appointment({
      amount: doctor.rate,
      time: req.body.time,
      date: req.body.date,
      ownedBy: {
        _id: patient._id,
        name: patient.first_name + " " + patient.last_name,
        contact: patient.contact,
      },
      doctor: {
        name: doctor.first_name + " " + doctor.last_name,
        specialty: doctor.specialty,
      },
    });

    patient.appointments.push(appointment);
    doctor.requestAppointment.push(appointment);

    await patient.save();
    await appointment.save();
    await doctor.save();
    res.send(appointment);
  } catch (e) {
    next(e);
  }
});

router.get("/getAppointments", [auth, isPatient], async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.user._id }).select(
      "appointments"
    );

    if (!patient) return res.status(400).send("No Patient was found.");

    res.send(patient.appointments);
  } catch (ex) {
    next(ex);
  }
});

router.get(
  "/getAcceptedAppointments",
  [auth, isPatient],
  async (req, res, next) => {
    try {
      const patient = await Patient.findOne({ _id: req.user._id }).select(
        "appointmentHistory"
      );
      if (!patient) return res.status(400).send("No Patient was found.");

      res.send(patient.appointmentHistory);
    } catch (ex) {
      next(ex);
    }
  }
);

// =========================================================================
// ================ AUTHENTICATION AND AUTHORIZATION =======================
// =========================================================================

router.post(
  "/register",
  upload.single("img"),
  // register,
  async (req, res, next) => {
    try {
      console.log(req.body);
      const { first_name, last_name, contact, email, pass1 } = req.body;
      const { error } = patientRegisterValidator(req.body);
      if (error) {
        for (let item of error.details) {
          console.log("Error patient route line 143");
          return res.status(400).send(item.message);
        }
      }

      let patient = await Patient.findOne({ email });
      if (patient)
        return res
          .status(400)
          .send("User with this email is already registered.");

      patient = new Patient({
        profile_picture: !req.file
          ? "https://www.kindpng.com/picc/m/451-4517876_default-profile-hd-png-download.png"
          : req.file.path,
        first_name,
        last_name,
        contact,
        email,
        full_name: first_name + " " + last_name,
      });

      const salt = await bcrypt.genSalt(10);
      patient.password = await bcrypt.hash(pass1, salt);

      await patient.save();

      res.send(patient);
    } catch (e) {
      next(e);
    }
  }
);

router.post("/login", async (req, res, next) => {
  try {
    console.log(req.body);
    const { error } = patientLoginValidator(req.body);

    if (error) {
      for (let item of error.details) {
        return res.status(400).send(item.message);
      }
    }

    const patient = await Patient.findOne({ email: req.body.email }).select(
      "first_name last_name password"
    );
    if (!patient) return res.status(400).send("User did not found.");

    const validatePassword = await bcrypt.compare(
      req.body.password,
      patient.password
    );

    if (!validatePassword)
      return res.status(400).send("Password didn't match.");

    const token = patient.generateAuthToken();
    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(token);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
