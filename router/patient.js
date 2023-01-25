const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const multer = require("multer");

const { storage } = require("../cloudinary/index");
const upload = multer({ storage });

const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const { Appointment } = require("../models/appointment");

// const register = require("../middleware/patientRegister");
const { auth, isPatient } = require("../middleware/auth");
const { renderCustomId } = require("../helpers/customId");

const {
  patientRegisterValidator,
  patientLoginValidator,
  userUpdateValidator,
  appointmentValidator,
  userChangePassValidator,
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

    const doctor = await Doctor.find({ full_name: query, isConfirmed: true });
    res.send(doctor);
  } catch (ex) {
    next(ex);
  }
});

router.get("/search_doc_display/:docDisplay", async (req, res, next) => {
  try {
    const doc = await Doctor.findById(req.params.docDisplay).select(
      "profile_picture full_name specialty rate"
    );
    if (!doc) return res.status(400).send("Doctor did not found.");
    res.send(doc);
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
      modeOfConsultation: req.body.mode_of_consultation,
      ownedBy: {
        _id: patient._id,
        name: patient.first_name + " " + patient.last_name,
        contact: patient.contact,
        gender: patient.gender,
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
    // res.send("Hello");
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

router.get("/prescriptions", [auth, isPatient], async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.user._id }).select(
      "prescriptions"
    );
    if (!patient) return res.status(400).send("Patient did not found.");

    res.send(patient.prescriptions);
  } catch (ex) {
    next(ex);
  }
});

// =========================================================================
// ================ AUTHENTICATION AND AUTHORIZATION =======================
// =========================================================================

router.post("/change-password", [auth, isPatient], async (req, res, next) => {
  try {
    const { currPass, newPass, confirmPass } = req.body;
    const { error } = userChangePassValidator(req.body);
    if (error) {
      for (let item of error.details) {
        return res.status(400).send(item.message);
      }
    }
    const patient = await Patient.findOne({ _id: req.user._id }).select(
      "password"
    );
    if (!patient) return res.status(400).send("User did not found.");

    if (newPass !== confirmPass)
      return res
        .status(400)
        .send("New Password and Confirm Password did not match.");

    const validPass = await bcrypt.compare(currPass, patient.password);
    if (!validPass)
      return res.status(400).send("Current Password did not match.");

    const salt = await bcrypt.genSalt(10);
    patient.password = await bcrypt.hash(newPass, salt);

    await patient.save();
    res.send(patient);
  } catch (ex) {
    next(ex);
  }
});

router.post(
  "/updateAccount",
  upload.single("img"),
  [auth, isPatient],
  async (req, res, next) => {
    try {
      const { first_name, last_name, email, contact } = req.body;
      const { error } = userUpdateValidator(req.body);
      if (error) {
        for (let item of error.details) {
          return res.status(400).send(item.message);
        }
      }
      const patient = await Patient.findOne({ _id: req.user._id });
      if (!patient) return res.status(400).send("No Patient was found.");

      patient.first_name = first_name;
      patient.last_name = last_name;
      patient.full_name = patient.first_name + " " + patient.last_name;
      patient.email = email;
      patient.contact = contact;
      patient.profile_picture = !req.file
        ? patient.profile_picture
        : req.file.path;

      await patient.save();
      console.log(req.file);
      res.send(patient);
    } catch (ex) {
      next(ex);
    }
  }
);

router.post(
  "/register",
  upload.single("img"),
  // register,
  async (req, res, next) => {
    try {
      const { first_name, gender, last_name, contact, email, pass1 } = req.body;
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
        gender,
        full_name: first_name + " " + last_name,
        customId: renderCustomId(7, 4),
      });

      const salt = await bcrypt.genSalt(10);
      patient.password = await bcrypt.hash(pass1, salt);

      await patient.save();
      console.log(patient);
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
