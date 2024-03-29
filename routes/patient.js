const express = require("express");

const router = express.Router();
const bcrypt = require("bcrypt");

const { isAuth, isPatient } = require("../middleware/auth");
const Patient = require("../models/Patient");
const { Appointment } = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const multer = require("multer");
const { cloudinary, storage } = require("../cloudinary/cloudinary");
const upload = multer({ storage });

const {
  userLoginValidator,
  patientRegisterValidator,
  documentIdValidator,
  appointmentValidator,
  userUpdatePassword,
  userUpdateAccountValidator,
} = require("../utils/formValidator");
const Admin = require("../models/Admin");

// =========================================================================
// ================ GET THE DATA OF THE CURRENT PATIENT ====================
// =========================================================================

router.get("/me", [isAuth, isPatient], async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.user._id }).populate(
      "appointments"
    );
    if (!patient) return res.status(404).send("Patient not found.");

    res.send(patient);
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// ============ GET THE PRESCRIPTION OF THE CURRENT PATIENT ================
// =========================================================================

router.get("/prescription", [isAuth, isPatient], async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.user._id })
      .select("appointments")
      .populate("appointments");
    if (!patient) return res.status(404).send("Patient not found.");

    const prescription = patient.appointments.filter((item) => {
      return item.prescription !== "" && item.status !== "Done";
    });
    res.send(prescription);
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// ============ GET THE MEDICAL RECORDS OF THE CURRENT PATIENT =============
// =========================================================================

router.get("/medical-records", [isAuth, isPatient], async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.user._id })
      .select("appointments")
      .populate("appointments");
    if (!patient) return res.status(404).send("Patient not found.");

    const medicalRecords = patient.appointments.filter((item) => {
      return !item.forRecords;
    });

    res.send(medicalRecords);
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// ============ GET THE APPOINTMENTS OF THE CURRENT PATIENT ================
// =========================================================================

router.get("/getAppointments", [isAuth, isPatient], async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.user._id })
      .select("appointments")
      .populate("appointments");
    if (!patient) return res.status(404).send("Patient not found.");

    const validAppts = patient.appointments.filter((item) => {
      return item.status === "Pending";
    });

    res.send(validAppts);
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// ================== PATIENT WILL REQUEST AN APPOINTMENT ==================
// =========================================================================

router.post("/request-appt", [isAuth, isPatient], async (req, res, next) => {
  try {
    const { doc_id, date, mode_of_consult, time } = req.body;

    const { error } = appointmentValidator(req.body);
    if (error) {
      for (let items of error.details) {
        return res.status(400).send(items.message);
      }
    }

    let doctor = await Doctor.findOne({ _id: doc_id }).select(
      "full_name specialty profile_pic rate appointments"
    );
    if (!doctor) return res.status(404).send("Doctor did not found.");

    let patient = await Patient.findOne({ _id: req.user._id }).select(
      "full_name profile_pic appointments"
    );
    if (!patient) return res.status(404).send("Patient did not found.");

    const admin = await Admin.findOne({ email: process.env.admin_email })
      .select("listOfAppointments")
      .populate("listOfAppointments");
    if (!admin) return res.status(404).send("Patient did not found.");

    let appt = new Appointment({
      doctor: {
        _id: doctor._id,
        full_name: doctor.full_name,
        profile_pic: doctor.profile_pic,
        specialty: doctor.specialty,
      },
      patient: {
        _id: patient._id,
        full_name: patient.full_name,
        profile_pic: patient.profile_pic,
      },

      amount: doctor.rate,
      date,
      time,
      mode_of_consult,
    });

    doctor.appointments.push(appt);
    patient.appointments.push(appt);
    admin.listOfAppointments.push(appt);

    await appt.save();
    await doctor.save();
    await patient.save();
    await admin.save();
    res.send(appt);
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// ===================== PATIENT POST PRESCRIPTION =========================
// =========================================================================

router.post(
  "/post-prescription",
  [isAuth, isPatient],
  async (req, res, next) => {
    try {
      const { appt_id } = req.body;

      const { error } = documentIdValidator(req.body);
      if (error) {
        for (let items of error.details) {
          return res.status(400).send(items.message);
        }
      }

      const appt = await Appointment.findOne({ _id: appt_id });

      if (!appt) return res.status(404).send("Appointment did not found.");

      appt.status = "Done";
      await appt.save();

      res.send(appt);
    } catch (error) {
      next(error);
    }
  }
);

// =========================================================================
// ================== PATIENT WILL CANCEL APPOINTMENT ======================
// =========================================================================

router.post("/cancel-appt", [isAuth, isPatient], async (req, res, next) => {
  try {
    const { document_id } = req.body;

    const { error } = documentIdValidator(req.body);
    if (error) {
      for (let items of error.details) {
        return res.status(400).send(items.message);
      }
    }

    const appt = await Appointment.findOne({ _id: document_id });

    if (!appt) return res.status(404).send("Appointment did not found.");

    appt.status = "Cancelled";
    await appt.save();

    res.send(appt);
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// ==== REMOVE THE APPOINTMENT AFTER CLICKING THE DONE OR REMOVE BUTTON ====
// =========================================================================

router.post(
  "/post-appt/:appt_id",
  [isAuth, isPatient],
  async (req, res, next) => {
    try {
      const { appt_id } = req.params;

      const { error } = documentIdValidator(req.params);

      if (error) {
        for (let items of error.details) {
          return res.status(400).send(items.message);
        }
      }

      const appt = await Appointment.findOne({ _id: appt_id });
      if (!appt) return res.status(404).send("Appointment did not found.");

      const patient = await Patient.findOne({ _id: req.user._id })
        .select("appointments")
        .populate("appointments");

      const newAppts = patient.appointments.filter((appt) => {
        return appt._id.toString() !== appt_id;
      });

      appt.forRecords = true;
      patient.appointments = newAppts;
      await patient.save();
      await appt.save();

      res.send(patient);
    } catch (error) {
      next(error);
    }
  }
);

// =========================================================================
// ==================== UPDATE ACCOUNT OF PATIENT  ========================
// =========================================================================

router.post(
  "/update-account",
  upload.single("img"),
  [isAuth, isPatient],
  async (req, res, next) => {
    try {
      const { first_name, last_name, email, contact } = req.body;
      const { error } = userUpdateAccountValidator(req.body);
      if (error) {
        for (let items of error.details) {
          return res.status(400).send(items.message);
        }
      }

      const patient = await Patient.findOne({ _id: req.user._id });
      if (!patient) return res.status(404).send("Patient did not found.");

      patient.first_name = first_name;
      patient.last_name = last_name;
      patient.email = email;
      patient.contact = contact;
      patient.profile_pic = !req.file ? patient.profile_pic : req.file.path;

      await patient.save();

      res.send(patient);
    } catch (error) {
      next(error);
    }
  }
);

// =========================================================================
// ==================== UPDATE PASSWORD OF PATIENT  ========================
// =========================================================================

router.post("/update-pass", [isAuth, isPatient], async (req, res, next) => {
  try {
    const { currentPass, newPass, confirmPass } = req.body;

    const { error } = userUpdatePassword(req.body);

    if (error) {
      for (let items of error.details) {
        return res.status(400).send(items.message);
      }
    }

    const patient = await Patient.findOne({ _id: req.user._id }).select(
      "password"
    );

    if (!patient) return res.status(400).send("Patient did not found.");

    if (newPass !== confirmPass)
      return res
        .status(400)
        .send("Confirm Password and New Password did not match.");

    const validPassword = await bcrypt.compare(currentPass, patient.password);
    if (!validPassword)
      return res
        .status(400)
        .send("Current Password did not meet your current credentials.");

    const salt = await bcrypt.genSalt(10);
    patient.password = await bcrypt.hash(confirmPass, salt);

    await patient.save();

    res.send(patient);
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// ======================= REGISTER OF THE PATIENT =========================
// =========================================================================

router.post("/register", async (req, res, next) => {
  try {
    const { first_name, last_name, email, contact, confirm_pass, password } =
      req.body;

    const { error } = patientRegisterValidator(req.body);
    if (error) {
      for (let item of error.details) {
        return res.status(400).send(item.message);
      }
    }
    if (confirm_pass !== password)
      return res
        .status(400)
        .send("Confirm Password and Password did not match.");

    let patient = await Patient.findOne({ email });
    if (patient)
      return res.status(409).send("This email is already registered.");

    patient = new Patient({
      first_name,
      last_name,
      email,
      contact,
      full_name: first_name + " " + last_name,
    });

    const salt = await bcrypt.genSalt(10);
    patient.password = await bcrypt.hash(password, salt);

    const admin = await Admin.findOne({ email: process.env.admin_email })
      .select("listOfPatients")
      .populate("listOfPatients");

    if (!admin) return res.status(404).send("Admin did not found.");

    admin.listOfPatients.push(patient);
    await patient.save();
    await admin.save();
    res.send(patient);
  } catch (ex) {
    next(ex);
  }
});

// =========================================================================
// ======================== LOGIN OF THE PATIENT ===========================
// =========================================================================

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { error } = userLoginValidator(req.body);
    if (error) {
      for (let item of error.details) {
        return res.status(400).send(item.message);
      }
    }

    let patient = await Patient.findOne({ email }).select("password");
    if (!patient) return res.status(404).send("User did not found.");

    const validPassword = await bcrypt.compare(password, patient.password);
    if (!validPassword)
      return res.status(400).send("Credentials did not match.");

    const token = patient.generateAuthToken();

    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(token);
  } catch (ex) {
    next(ex);
  }
});

module.exports = router;
