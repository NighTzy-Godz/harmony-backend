const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const Doctor = require("../models/Doctor");
const { isAuth, isDoctor } = require("../middleware/auth");
const { Appointment } = require("../models/Appointment");
const Patient = require("../models/Patient");
const {
  decideAppointmentValidator,
  prescriptionValidator,
  userUpdatePassword,
} = require("../utils/formValidator");

// =========================================================================
// ================ GET ALL THE DATA OF THE CURRENT DOCTOR =================
// =========================================================================
router.get("/me", [isAuth, isDoctor], async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.user._id });
    if (!doctor) return res.status(404).send("Doctor Did not Found.");

    res.send(doctor);
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// =================== GET ALL THE DATA OF THE DOCTORS =====================
// =========================================================================

router.get("/all-doctors", async (req, res, next) => {
  try {
    const doctors = await Doctor.find();
    res.send(doctors);
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// ============= GET DOCTOR DEPENDING ON THE PATIENT'S SEARCH ==============
// =========================================================================

router.get("/search_doc/:search", async (req, res, next) => {
  try {
    const query = new RegExp(`.*${req.params.search}.*`, "i");

    const doctor = await Doctor.find({ full_name: query });
    res.send(doctor);
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// ========= GET ALL THE REQUEST APPOINTMENTS OF THE DOCTOR ================
// =========================================================================

router.get("/req-appts", [isAuth, isDoctor], async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.user._id })
      .select("appointments")
      .populate("appointments");

    if (!doctor) return res.status(404).send("Doctor did not found.");

    const reqAppts = doctor.appointments.filter((item) => {
      return item.status === "Pending";
    });

    res.send(reqAppts);
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// ========== GET ALL THE INCOMING APPOINTMENTS OF THE DOCTOR ==============
// =========================================================================

router.get("/incoming-appts", [isAuth, isDoctor], async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.user._id })
      .select("appointments")
      .populate("appointments");

    if (!doctor) return res.status(404).send("Doctor did not found.");

    const incomingAppts = doctor.appointments.filter((item) => {
      return item.status === "Confirmed" && item.prescription === "";
    });

    res.send(incomingAppts);
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// ============= GIVE THE PRESCRIPTION AFTER THE APPOINTMENT ===============
// =========================================================================

router.post("/post-appt", [isAuth, isDoctor], async (req, res, next) => {
  try {
    const { appt_id, prescription, findings } = req.body;

    const { error } = prescriptionValidator(req.body);

    console.log(error);
    if (error) {
      for (let items of error.details) {
        return res.status(400).send(items.message);
      }
    }

    const appt = await Appointment.findOne({ _id: appt_id });
    if (!appt) return res.status(404).send("Appointment did not found.");

    appt.findings = findings;
    appt.prescription = prescription;

    await appt.save();
    res.send(appt);
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// =========== DECIDE WHETHER ACCEPT OR DECLINE AN APPOINTMENT =============
// =========================================================================

router.post("/decide-appt", [isAuth, isDoctor], async (req, res, next) => {
  try {
    const { appt_id, status } = req.body;
    const { error } = decideAppointmentValidator(req.body);

    if (error) {
      for (let items of error.details) {
        return res.status(400).send(items.message);
      }
    }

    const appt = await Appointment.findOne({ _id: appt_id });
    if (!appt) return res.status(404).send("Appointment did not found.");

    appt.status = status;
    await appt.save();
    res.send(appt);
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// ================ UPDATING THE PASSWORD OF THE DOCTOR ====================
// =========================================================================

router.post("/update-pass", [isAuth, isDoctor], async (req, res, next) => {
  try {
    const { currentPass, newPass, confirmPass } = req.body;

    const { error } = userUpdatePassword(req.body);
    if (error) {
      for (let items of error.details) {
        return res.status(400).send(items.message);
      }
    }

    const doctor = await Doctor.findOne({ _id: req.user._id }).select(
      "password"
    );

    if (!doctor) return res.status(404).send("Doctor did not found.");

    if (newPass !== confirmPass) {
      return res
        .status(400)
        .send("New Password and Confirm Password did not match.");
    }

    const validPassword = await bcrypt.compare(currentPass, doctor.password);
    if (!validPassword)
      return res.status(400).send("Current Credentials did not meet.");

    const salt = await bcrypt.genSalt(10);
    doctor.password = await bcrypt.hash(confirmPass, salt);

    await doctor.save();
    res.send(doctor);
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// ===================== REGISTERING OF A DOCTOR ===========================
// =========================================================================

router.post("/register", async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      contact,
      email,
      gender,
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
      gender,
      specialty,
      full_name: first_name + " " + last_name,
    });

    const salt = await bcrypt.genSalt(10);
    doctor.password = await bcrypt.hash(password, salt);

    await doctor.save();

    res.send(doctor);
  } catch (ex) {
    next(ex);
  }
});

// =========================================================================
// ======================== LOGIN OF A DOCTOR ==============================
// =========================================================================

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
